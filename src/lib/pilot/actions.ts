"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { limitMessage, takeQuota } from "@/lib/app/limits";
import { ensureBusiness } from "@/lib/app/queries";
import { isYmd, mondayOf, todayIn } from "./dates";
import { buildPack } from "./pack";
import { listUploads, loadExamples } from "./queries";
import { SOURCES } from "./types";

type Result = { ok: true; message?: string } | { ok: false; message: string };

function fail(e: unknown): Result {
  if (e instanceof z.ZodError) return { ok: false, message: e.issues[0]?.message ?? "Check the form." };
  return { ok: false, message: e instanceof Error ? e.message : "Something went wrong." };
}

function refresh() {
  revalidatePath("/dashboard", "layout");
}

const week = z.string().refine(isYmd, "Pick a week.").transform(mondayOf);

/* ---------------- Weekly pack ---------------- */

export async function makePack(input: { weekOf: string; notes: string }): Promise<Result> {
  try {
    const weekOf = week.parse(input.weekOf);
    const notes = z.string().max(2000, "Keep the list under 2,000 characters.").parse(input.notes);
    const { supabase, user, business } = await ensureBusiness();

    const approved = await supabase.from("posts").select("id", { count: "exact", head: true }).eq("business_id", business.id).eq("week_of", weekOf).neq("status", "draft");
    if ((approved.count ?? 0) > 0) return { ok: false, message: "Some of this week's posts are already approved. Edit those instead of starting over." };

    const media = await listUploads(supabase, user.id, weekOf);
    if (!media.length && !notes.trim()) return { ok: false, message: "Add a few photos or write what's new in the store first." };
    if (!(await takeQuota(supabase, "pack"))) return { ok: false, message: limitMessage.pack };

    const examples = await loadExamples(supabase, user.id);
    const { posts, model } = await buildPack({ store: business.name || "the store", city: business.city, notes, media, examples });
    await supabase.from("posts").delete().eq("business_id", business.id).eq("week_of", weekOf).eq("status", "draft");
    const { error } = await supabase.from("posts").insert(
      posts.map((p) => ({
        business_id: business.id,
        owner_id: user.id,
        week_of: weekOf,
        position: p.position,
        day: p.day,
        kind: p.kind,
        title: p.title,
        hook: p.hook,
        caption: p.caption,
        items: p.items,
        media_path: p.mediaPath,
      })),
    );
    if (error) throw error;
    await supabase.from("events").insert({ business_id: business.id, owner_id: user.id, kind: "video", text: "7 posts ready for this week. Waiting on your okay." });
    refresh();
    return { ok: true, message: model ? "7 posts ready. Read them over, then approve." : "7 posts ready from the template. Edit the captions before you approve." };
  } catch (e) {
    return fail(e);
  }
}

const postEdit = z.object({
  id: z.string().uuid(),
  caption: z.string().trim().min(1, "The caption can't be empty.").max(2200),
  items: z.array(z.string().trim().min(1).max(120)).max(6),
});

export async function updatePost(input: z.input<typeof postEdit>): Promise<Result> {
  try {
    const p = postEdit.parse(input);
    const { supabase } = await ensureBusiness();
    const { error } = await supabase.from("posts").update({ caption: p.caption, items: p.items, updated_at: new Date().toISOString() }).eq("id", p.id);
    if (error) throw error;
    refresh();
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function setPostStatus(input: { id: string; status: "draft" | "approved" | "posted" }): Promise<Result> {
  try {
    const p = z.object({ id: z.string().uuid(), status: z.enum(["draft", "approved", "posted"]) }).parse(input);
    const { supabase } = await ensureBusiness();
    const { error } = await supabase.from("posts").update({ status: p.status, updated_at: new Date().toISOString() }).eq("id", p.id);
    if (error) throw error;
    refresh();
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function approveWeek(input: { weekOf: string }): Promise<Result> {
  try {
    const weekOf = week.parse(input.weekOf);
    const { supabase, business } = await ensureBusiness();
    const { error } = await supabase.from("posts").update({ status: "approved", updated_at: new Date().toISOString() }).eq("business_id", business.id).eq("week_of", weekOf).eq("status", "draft");
    if (error) throw error;
    refresh();
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function removeUpload(input: { path: string }): Promise<Result> {
  try {
    const { supabase, user } = await ensureBusiness();
    const path = z.string().max(300).parse(input.path);
    if (!path.startsWith(`${user.id}/pack/`)) return { ok: false, message: "That file isn't yours." };
    const { error } = await supabase.storage.from("clips").remove([path]);
    if (error) throw error;
    refresh();
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

/* ---------------- Checkout tap ---------------- */

const checkoutSchema = z.object({
  source: z.enum(SOURCES.map((s) => s.id) as [string, ...string[]]),
  amount: z.coerce.number().min(0, "Enter the sale amount.").max(100000),
  postId: z.string().uuid().nullable().optional(),
});

export async function logCheckout(input: z.input<typeof checkoutSchema>): Promise<Result> {
  try {
    const c = checkoutSchema.parse(input);
    const { supabase, user, business } = await ensureBusiness();
    const { error } = await supabase.from("checkouts").insert({
      business_id: business.id,
      owner_id: user.id,
      source: c.source,
      amount: Math.round(c.amount),
      post_id: c.source === "post" ? c.postId ?? null : null,
      sold_on: todayIn(business.timezone),
    });
    if (error) throw error;
    refresh();
    return { ok: true, message: `Logged $${Math.round(c.amount).toLocaleString()}.` };
  } catch (e) {
    return fail(e);
  }
}

export async function deleteCheckout(input: { id: string }): Promise<Result> {
  try {
    const id = z.string().uuid().parse(input.id);
    const { supabase } = await ensureBusiness();
    const { error } = await supabase.from("checkouts").delete().eq("id", id);
    if (error) throw error;
    refresh();
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

/* ---------------- Weekly numbers ---------------- */

export async function saveWeeklySales(input: { weekOf: string; amount: number | string }): Promise<Result> {
  try {
    const weekOf = week.parse(input.weekOf);
    const amount = z.coerce.number().min(0, "Enter the week's sales.").max(10_000_000).parse(input.amount);
    const { supabase, user, business } = await ensureBusiness();
    const { error } = await supabase
      .from("weekly_sales")
      .upsert({ business_id: business.id, owner_id: user.id, week_of: weekOf, amount: Math.round(amount), updated_at: new Date().toISOString() });
    if (error) throw error;
    refresh();
    return { ok: true, message: "Saved." };
  } catch (e) {
    return fail(e);
  }
}

const itemRows = z
  .array(z.object({ item: z.string().trim().min(1).max(120), sold: z.coerce.number().int().min(0).max(100000), soldBefore: z.coerce.number().int().min(0).max(100000) }))
  .max(40);

export async function saveItemSales(input: { weekOf: string; rows: z.input<typeof itemRows> }): Promise<Result> {
  try {
    const weekOf = week.parse(input.weekOf);
    const rows = itemRows.parse(input.rows);
    const { supabase, user, business } = await ensureBusiness();
    if (rows.length) {
      const { error } = await supabase.from("item_sales").upsert(
        rows.map((r) => ({ business_id: business.id, owner_id: user.id, week_of: weekOf, item: r.item, sold: r.sold, sold_before: r.soldBefore })),
        { onConflict: "business_id,week_of,item" },
      );
      if (error) throw error;
    }
    refresh();
    return { ok: true, message: "Saved." };
  } catch (e) {
    return fail(e);
  }
}

export async function setPlanPrice(input: { price: number | string }): Promise<Result> {
  try {
    const price = z.coerce.number().int().min(0).max(10000).parse(input.price);
    const { supabase, business } = await ensureBusiness();
    const { error } = await supabase.from("businesses").update({ plan_price: price }).eq("id", business.id);
    if (error) throw error;
    refresh();
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}
