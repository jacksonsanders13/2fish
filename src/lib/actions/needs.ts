"use server";

import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getProfile, requireProfile, requireUser } from "@/lib/auth/server";
import { fail, keepValues, type ActionResult } from "@/lib/action-result";
import { MAX_PHOTO_BYTES, PHOTO_TYPES, needSchema, reportSchema } from "@/lib/validation/need";
import { extensionFor } from "@/lib/storage";
import { emailUser } from "@/lib/email";
import { safeUrl } from "@/lib/format";

const NEED_FIELDS = ["title", "description", "category", "urgency", "fulfillment", "wishlistUrl"];

function parseNeed(formData: FormData) {
  return needSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    category: formData.get("category"),
    urgency: formData.get("urgency") ?? "normal",
    fulfillment: formData.get("fulfillment") ?? "in_person",
    wishlistUrl: formData.get("wishlistUrl") ?? "",
  });
}

async function uploadPhoto(userId: string, file: File | null): Promise<{ path?: string; error?: string }> {
  if (!file || file.size === 0) return {};
  if (!PHOTO_TYPES.includes(file.type)) return { error: "Photos need to be JPG, PNG or WebP." };
  if (file.size > MAX_PHOTO_BYTES) return { error: "That photo is over 5 MB. Try a smaller one." };
  const supabase = await createClient();
  const path = `${userId}/${randomUUID()}.${extensionFor(file.type)}`;
  const { error } = await supabase.storage.from("need-photos").upload(path, file, { contentType: file.type, upsert: false });
  if (error) return { error: "Couldn't upload the photo. Try again, or post without it." };
  return { path };
}

function friendlyDbError(message: string) {
  // our own raise exception messages are already friendly; everything else gets a generic line
  if (/open needs|posted a lot|can't post|can't help|can't offer|own need|already offered|active offer|Only the poster|no helper|can't message|not part|Slow down/i.test(message)) {
    return message;
  }
  return "That didn't go through. Try again in a moment.";
}

export async function createNeed(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const profile = await requireProfile("/needs/new");
  const parsed = parseNeed(formData);
  if (!parsed.success) {
    return fail("Check the fields below.", { fieldErrors: z.flattenError(parsed.error).fieldErrors, values: keepValues(formData, NEED_FIELDS) });
  }
  if (profile.lat == null || profile.lng == null || !profile.zip) redirect("/onboarding?next=/needs/new");

  const photo = await uploadPhoto(profile.id, formData.get("photo") as File | null);
  if (photo.error) return fail(photo.error, { fieldErrors: { photo: [photo.error] }, values: keepValues(formData, NEED_FIELDS) });

  const d = parsed.data;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("needs")
    .insert({
      poster_id: profile.id,
      title: d.title,
      description: d.description,
      category: d.category,
      urgency: d.urgency,
      fulfillment: d.fulfillment,
      wishlist_url: d.fulfillment === "in_person" ? null : safeUrl(d.wishlistUrl),
      photo_path: photo.path ?? null,
      zip: profile.zip,
      lat: profile.lat,
      lng: profile.lng,
    })
    .select("id")
    .single();
  if (error || !data) {
    if (photo.path) await supabase.storage.from("need-photos").remove([photo.path]);
    return fail(friendlyDbError(error?.message ?? ""), { values: keepValues(formData, NEED_FIELDS) });
  }
  revalidatePath("/needs");
  revalidatePath("/dashboard");
  redirect(`/needs/${data.id}?posted=1`);
}

export async function updateNeed(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  const parsed = parseNeed(formData);
  if (!parsed.success) {
    return fail("Check the fields below.", { fieldErrors: z.flattenError(parsed.error).fieldErrors, values: keepValues(formData, NEED_FIELDS) });
  }
  const supabase = await createClient();
  const { data: existing } = await supabase.from("needs").select("id, poster_id, photo_path").eq("id", id).maybeSingle();
  if (!existing || existing.poster_id !== user.id) return fail("You can only edit your own posts.");

  const removePhoto = formData.get("removePhoto") === "on";
  const photo = await uploadPhoto(user.id, formData.get("photo") as File | null);
  if (photo.error) return fail(photo.error, { fieldErrors: { photo: [photo.error] }, values: keepValues(formData, NEED_FIELDS) });
  const newPath = photo.path ?? (removePhoto ? null : existing.photo_path);

  const d = parsed.data;
  const { error } = await supabase
    .from("needs")
    .update({
      title: d.title,
      description: d.description,
      category: d.category,
      urgency: d.urgency,
      fulfillment: d.fulfillment,
      wishlist_url: d.fulfillment === "in_person" ? null : safeUrl(d.wishlistUrl),
      photo_path: newPath,
    })
    .eq("id", id);
  if (error) return fail(friendlyDbError(error.message), { values: keepValues(formData, NEED_FIELDS) });

  if (existing.photo_path && existing.photo_path !== newPath) {
    await supabase.storage.from("need-photos").remove([existing.photo_path]);
  }
  revalidatePath(`/needs/${id}`);
  revalidatePath("/needs");
  redirect(`/needs/${id}`);
}

export async function deleteNeed(formData: FormData): Promise<void> {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  const supabase = await createClient();
  const { data: existing } = await supabase.from("needs").select("id, poster_id, photo_path").eq("id", id).maybeSingle();
  if (!existing || existing.poster_id !== user.id) redirect(`/needs/${id}`);
  await supabase.from("needs").delete().eq("id", id);
  if (existing.photo_path) await supabase.storage.from("need-photos").remove([existing.photo_path]);
  revalidatePath("/needs");
  revalidatePath("/dashboard");
  redirect("/dashboard?deleted=1");
}

// ---- status changes (all go through database functions) ----

type Rpc = "offer_help" | "cancel_offer" | "mark_fulfilled" | "close_need" | "reopen_need";

async function callStatusRpc(fn: Rpc, needId: string): Promise<{ error?: string; threadId?: string }> {
  const supabase = await createClient();
  if (fn === "offer_help") {
    const { data, error } = await supabase.rpc("offer_help", { p_need_id: needId });
    if (error) return { error: friendlyDbError(error.message) };
    return { threadId: (data as { id: string } | null)?.id };
  }
  const { error } = await supabase.rpc(fn, { p_need_id: needId });
  return error ? { error: friendlyDbError(error.message) } : {};
}

export async function offerHelp(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const profile = await requireProfile();
  const needId = String(formData.get("id") ?? "");
  const r = await callStatusRpc("offer_help", needId);
  if (r.error) return fail(r.error);

  // email the poster (no-op without RESEND_API_KEY)
  const supabase = await createClient();
  const { data: need } = await supabase.from("needs").select("title, poster_id").eq("id", needId).maybeSingle();
  if (need) {
    await emailUser(
      need.poster_id,
      `${profile.display_name} can help with "${need.title}"`,
      [`${profile.display_name} offered to help with your need "${need.title}".`, "Open the conversation on 2fish to work out the details. Remember to meet somewhere public."],
      r.threadId ? `/messages/${r.threadId}` : "/dashboard",
    );
  }
  revalidatePath(`/needs/${needId}`);
  revalidatePath("/needs");
  revalidatePath("/dashboard");
  redirect(r.threadId ? `/messages/${r.threadId}?offered=1` : `/needs/${needId}`);
}

export async function cancelOffer(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  await requireUser();
  const needId = String(formData.get("id") ?? "");
  const r = await callStatusRpc("cancel_offer", needId);
  if (r.error) return fail(r.error);
  revalidatePath(`/needs/${needId}`);
  revalidatePath("/needs");
  revalidatePath("/dashboard");
  return { ok: true, message: "Your offer is cancelled. The need is open again." };
}

export async function markFulfilled(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  await requireUser();
  const needId = String(formData.get("id") ?? "");
  const supabase = await createClient();
  const { data: need } = await supabase.from("needs").select("title, helper_id").eq("id", needId).maybeSingle();
  const r = await callStatusRpc("mark_fulfilled", needId);
  if (r.error) return fail(r.error);
  if (need?.helper_id) {
    await emailUser(need.helper_id, `"${need.title}" is fulfilled. Thank you.`, [`Your neighbor marked "${need.title}" as received.`, "A little was enough. Thank you for showing up."], `/needs/${needId}`);
  }
  revalidatePath(`/needs/${needId}`);
  revalidatePath("/needs");
  revalidatePath("/dashboard");
  return { ok: true, message: "Marked fulfilled. Your helper has been thanked." };
}

export async function closeNeed(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  await requireUser();
  const needId = String(formData.get("id") ?? "");
  const r = await callStatusRpc("close_need", needId);
  if (r.error) return fail(r.error);
  revalidatePath(`/needs/${needId}`);
  revalidatePath("/needs");
  revalidatePath("/dashboard");
  return { ok: true, message: "Closed. It's off the board now." };
}

export async function reopenNeed(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  await requireUser();
  const needId = String(formData.get("id") ?? "");
  const r = await callStatusRpc("reopen_need", needId);
  if (r.error) return fail(r.error);
  revalidatePath(`/needs/${needId}`);
  revalidatePath("/needs");
  revalidatePath("/dashboard");
  return { ok: true, message: "Reopened. Neighbors can see it again." };
}

// ---- safety ----

export async function submitReport(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = reportSchema.safeParse({
    targetType: formData.get("targetType"),
    targetId: formData.get("targetId"),
    reason: formData.get("reason"),
    details: formData.get("details") ?? "",
  });
  if (!parsed.success) return fail("Pick a reason so we know what to look at.", { fieldErrors: z.flattenError(parsed.error).fieldErrors });
  const supabase = await createClient();
  const { error } = await supabase.from("reports").insert({
    reporter_id: user.id,
    target_type: parsed.data.targetType,
    target_id: parsed.data.targetId,
    reason: parsed.data.reason,
    details: parsed.data.details || null,
  });
  if (error) return fail("Couldn't send that report. Try again in a moment.");
  return { ok: true, message: "Thanks. A person will review this." };
}

export async function blockUser(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  await requireUser();
  const targetId = String(formData.get("userId") ?? "");
  if (!z.uuid().safeParse(targetId).success) return fail("Something went wrong.");
  const supabase = await createClient();
  const { error } = await supabase.rpc("block_user", { p_user_id: targetId });
  if (error) return fail(friendlyDbError(error.message));
  revalidatePath("/", "layout");
  return { ok: true, message: "Blocked. They can't see your posts or message you." };
}

export async function unblockUser(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const user = await requireUser();
  const targetId = String(formData.get("userId") ?? "");
  const supabase = await createClient();
  await supabase.from("blocks").delete().eq("blocker_id", user.id).eq("blocked_id", targetId);
  revalidatePath("/settings/blocked");
  return { ok: true, message: "Unblocked." };
}

export async function getMyProfileForForm() {
  return getProfile();
}
