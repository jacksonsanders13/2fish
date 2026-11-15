-- 2fish Phase 2: one business per owner, their audits, and the plan each audit produced.
-- Applied to the Supabase project on 2026-11-14. Kept here so the schema is in git.

create table public.businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null default '',
  kind text not null,
  created_at timestamptz not null default now()
);
create index businesses_owner_idx on public.businesses(owner_id);

create table public.audits (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  answers jsonb not null,
  created_at timestamptz not null default now()
);
create index audits_owner_idx on public.audits(owner_id);

create table public.plans (
  id uuid primary key default gen_random_uuid(),
  audit_id uuid not null references public.audits(id) on delete cascade,
  business_id uuid not null references public.businesses(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  total_monthly integer not null,
  leaks jsonb not null,
  summary text,
  model text,
  created_at timestamptz not null default now()
);
create index plans_owner_idx on public.plans(owner_id);

create table public.plan_steps (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.plans(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  rank smallint not null,
  key text not null,
  title text not null,
  detail text not null,
  impact_monthly integer not null,
  status text not null default 'not-started'
    check (status in ('not-started','needs-you','in-progress','live','done')),
  href text not null default '/dashboard',
  updated_at timestamptz not null default now()
);
create index plan_steps_plan_idx on public.plan_steps(plan_id);

-- Owners see only their own rows. Nothing is readable without a session.
alter table public.businesses enable row level security;
alter table public.audits enable row level security;
alter table public.plans enable row level security;
alter table public.plan_steps enable row level security;

create policy "own businesses" on public.businesses for all
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "own audits" on public.audits for all
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "own plans" on public.plans for all
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "own plan steps" on public.plan_steps for all
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());
