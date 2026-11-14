"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/server";
import { fail, type ActionResult } from "@/lib/action-result";

const uuid = z.uuid();

export async function resolveReport(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const status = formData.get("status") === "dismissed" ? "dismissed" : "resolved";
  const note = String(formData.get("note") ?? "").trim().slice(0, 500);
  if (!uuid.safeParse(id).success) return fail("Bad report id.");
  const supabase = await createClient();
  const { error } = await supabase
    .from("reports")
    .update({ status, resolved_by: admin.id, resolved_at: new Date().toISOString(), resolution_note: note || null })
    .eq("id", id);
  if (error) return fail("Couldn't update that report.");
  revalidatePath("/admin");
  return { ok: true, message: status === "resolved" ? "Report resolved." : "Report dismissed." };
}

export async function adminRemoveNeed(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const id = String(formData.get("needId") ?? "");
  const note = String(formData.get("note") ?? "").trim().slice(0, 500);
  if (!uuid.safeParse(id).success) return fail("Bad need id.");
  const supabase = await createClient();
  const { data: need } = await supabase.from("needs").select("photo_path").eq("id", id).maybeSingle();
  const { error } = await supabase.rpc("admin_remove_need", { p_need_id: id, p_note: note || null });
  if (error) return fail(error.message);
  if (need?.photo_path) await supabase.storage.from("need-photos").remove([need.photo_path]).catch(() => undefined);
  revalidatePath("/admin");
  revalidatePath("/needs");
  return { ok: true, message: "Post removed and the poster notified." };
}

export async function adminBanUser(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();
  const id = String(formData.get("userId") ?? "");
  const ban = formData.get("ban") !== "false";
  if (!uuid.safeParse(id).success) return fail("Bad user id.");
  if (id === admin.id) return fail("You can't ban yourself.");
  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_ban_user", { p_user_id: id, p_ban: ban });
  if (error) return fail(error.message);
  revalidatePath("/admin");
  return { ok: true, message: ban ? "User banned. Their open needs are closed." : "Ban lifted." };
}

export async function adminDeleteMessage(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const id = String(formData.get("messageId") ?? "");
  if (!uuid.safeParse(id).success) return fail("Bad message id.");
  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_delete_message", { p_message_id: id });
  if (error) return fail(error.message);
  revalidatePath("/admin");
  return { ok: true, message: "Message removed." };
}
