"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ensureBusiness } from "@/lib/app/queries";
import { adminClient } from "@/lib/supabase/admin";

type Result = { ok: true; message?: string } | { ok: false; message: string };

const row = z.object({
  kind: z.string().trim().max(40).default("other"),
  hook: z.string().trim().max(300).default(""),
  caption: z.string().trim().max(2200).default(""),
  why: z.string().trim().max(500).default(""),
  views: z.coerce.number().int().min(0).max(2_000_000_000).nullable().optional(),
  likes: z.coerce.number().int().min(0).max(2_000_000_000).nullable().optional(),
  link: z.string().trim().max(500).default(""),
});

/** Emails allowed to add examples every store learns from (Vercel env ADMIN_EMAILS, comma separated). */
function isAdmin(email: string | undefined) {
  const list = (process.env.ADMIN_EMAILS ?? "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
  return Boolean(email && list.includes(email.toLowerCase()));
}

export async function addExamples(input: { rows: unknown[]; global?: boolean }): Promise<Result> {
  try {
    const rows = z.array(row).min(1, "Add at least one example.").max(500, "Up to 500 at a time.").parse(input.rows);
    const clean = rows.filter((r) => r.hook || r.caption);
    if (!clean.length) return { ok: false, message: "Each example needs a hook or a caption." };
    const { supabase, user } = await ensureBusiness();

    const global = Boolean(input.global) && isAdmin(user.email);
    const records = clean.map((r) => ({ ...r, views: r.views ?? null, likes: r.likes ?? null, owner_id: user.id, is_global: global }));
    // Global examples skip RLS (owners can't write them), so they go through the server key.
    const db = global ? adminClient() : supabase;
    if (!db) return { ok: false, message: "Shared examples need SUPABASE_SECRET_KEY set in Vercel." };
    const { error } = await db.from("post_examples").insert(records);
    if (error) throw error;
    revalidatePath("/dashboard/examples");
    return { ok: true, message: `Added ${records.length} ${records.length === 1 ? "example" : "examples"}${global ? " for every store" : ""}.` };
  } catch (e) {
    if (e instanceof z.ZodError) return { ok: false, message: e.issues[0]?.message ?? "Check the examples." };
    return { ok: false, message: e instanceof Error ? e.message : "Something went wrong." };
  }
}

export async function deleteExample(input: { id: string }): Promise<Result> {
  try {
    const id = z.string().uuid().parse(input.id);
    const { supabase, user } = await ensureBusiness();
    const db = isAdmin(user.email) ? adminClient() ?? supabase : supabase;
    const { error } = await db.from("post_examples").delete().eq("id", id).eq("owner_id", user.id);
    if (error) throw error;
    revalidatePath("/dashboard/examples");
    return { ok: true };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Something went wrong." };
  }
}

export async function canAddGlobal() {
  const { user } = await ensureBusiness();
  return isAdmin(user.email);
}
