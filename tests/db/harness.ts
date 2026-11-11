// Spins up an in-memory Postgres (PGlite), fakes the bits of Supabase the
// migrations rely on (auth schema, roles, storage schema), then applies our
// migrations. Lets us test the schema and RLS without a Supabase project.
import { PGlite } from "@electric-sql/pglite";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const MIGRATIONS_DIR = join(process.cwd(), "supabase", "migrations");

const SUPABASE_STUBS = `

  create role anon nologin;
  create role authenticated nologin;
  create role service_role nologin bypassrls;
  grant usage on schema public to anon, authenticated, service_role;
  alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
  alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
  alter default privileges in schema public grant execute on functions to anon, authenticated, service_role;

  create schema auth;
  create table auth.users (
    id uuid primary key default gen_random_uuid(),
    email text,
    raw_user_meta_data jsonb not null default '{}'::jsonb,
    created_at timestamptz default now()
  );
  create function auth.uid() returns uuid
  language sql stable as $$
    select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
  $$;
  grant usage on schema auth to anon, authenticated;
  grant execute on function auth.uid() to anon, authenticated;

  create schema storage;
  create table storage.buckets (
    id text primary key, name text, public boolean, file_size_limit bigint, allowed_mime_types text[]
  );
  create table storage.objects (
    id uuid primary key default gen_random_uuid(), bucket_id text, name text, owner uuid
  );
  alter table storage.objects enable row level security;
  create function storage.foldername(name text) returns text[]
  language sql immutable as $$
    select (string_to_array(name, '/'))[1:array_length(string_to_array(name, '/'), 1) - 1]
  $$;
  grant usage on schema storage to anon, authenticated;
  grant all on storage.objects, storage.buckets to anon, authenticated;
  grant execute on function storage.foldername to anon, authenticated;

  create publication supabase_realtime;
`;

export type Db = {
  pg: PGlite;
  /** run statements as the postgres superuser */
  sql: (q: string, params?: unknown[]) => Promise<Record<string, unknown>[]>;
  /** run as a signed-in user (role authenticated) */
  as: (userId: string | null, q: string, params?: unknown[]) => Promise<Record<string, unknown>[]>;
  /** create an auth user, which fires the profile trigger */
  createUser: (email: string, meta?: Record<string, unknown>) => Promise<string>;
  close: () => Promise<void>;
};

export async function createDb(): Promise<Db> {
  const pg = new PGlite();
  await pg.exec(SUPABASE_STUBS);
  const files = readdirSync(MIGRATIONS_DIR).filter((f) => f.endsWith(".sql")).sort();
  for (const f of files) {
    await pg.exec(readFileSync(join(MIGRATIONS_DIR, f), "utf8"));
  }

  const sql: Db["sql"] = async (q, params = []) => (await pg.query(q, params)).rows as Record<string, unknown>[];

  const as: Db["as"] = async (userId, q, params = []) => {
    // Each call runs in its own transaction so the role switch never leaks.
    return pg.transaction(async (tx) => {
      await tx.exec(`set local role ${userId ? "authenticated" : "anon"};`);
      await tx.exec(`select set_config('request.jwt.claim.sub', '${userId ?? ""}', true);`);
      const r = await tx.query(q, params);
      return r.rows as Record<string, unknown>[];
    });
  };

  const createUser: Db["createUser"] = async (email, meta = {}) => {
    const rows = await sql(`insert into auth.users (email, raw_user_meta_data) values ($1, $2) returning id`, [
      email,
      JSON.stringify(meta),
    ]);
    return rows[0].id as string;
  };

  return { pg, sql, as, createUser, close: () => pg.close() };
}
