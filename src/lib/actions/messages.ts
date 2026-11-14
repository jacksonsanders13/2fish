"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/server";
import { fail, type ActionResult } from "@/lib/action-result";
import { messageSchema } from "@/lib/validation/need";
import { emailUser } from "@/lib/email";
import type { MessageRow } from "@/lib/supabase/database.types";

export async function sendMessage(_prev: ActionResult<MessageRow>, formData: FormData): Promise<ActionResult<MessageRow>> {
  const user = await requireUser();
  const parsed = messageSchema.safeParse({ threadId: formData.get("threadId"), body: formData.get("body") });
  if (!parsed.success) {
    const first = z.flattenError(parsed.error).fieldErrors.body?.[0];
    return fail(first ?? "Write something first.");
  }
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("send_message", { p_thread_id: parsed.data.threadId, p_body: parsed.data.body });
  if (error) return fail(/not part|can't message|Slow down|no longer/i.test(error.message) ? error.message : "Couldn't send that. Try again.");
  const message = data as MessageRow;

  // email the other person, but only if they don't already have an unread ping for this thread
  const { data: thread } = await supabase.from("threads").select("poster_id, helper_id, need_id").eq("id", parsed.data.threadId).maybeSingle();
  if (thread) {
    const other = thread.poster_id === user.id ? thread.helper_id : thread.poster_id;
    if (other) {
      const { count } = await supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("user_id", other)
        .eq("type", "message_received")
        .eq("href", `/messages/${parsed.data.threadId}`)
        .is("read_at", null);
      // the DB inserts a notification only when there wasn't one; mirror that for email
      if ((count ?? 0) <= 1) {
        const { data: me } = await supabase.from("profiles").select("display_name").eq("id", user.id).maybeSingle();
        await emailUser(other, `New message from ${me?.display_name ?? "a neighbor"} on 2fish`, [`${me?.display_name ?? "A neighbor"} sent you a message.`, `"${parsed.data.body.slice(0, 140)}${parsed.data.body.length > 140 ? "…" : ""}"`], `/messages/${parsed.data.threadId}`);
      }
    }
  }
  revalidatePath("/messages");
  return { ok: true, data: message };
}

export async function markThreadRead(threadId: string): Promise<void> {
  const user = await requireUser();
  if (!z.uuid().safeParse(threadId).success) return;
  const supabase = await createClient();
  await supabase.rpc("mark_thread_read", { p_thread_id: threadId });
  void user;
}

export async function markNotificationsRead(formData: FormData): Promise<void> {
  const user = await requireUser();
  const supabase = await createClient();
  const id = formData.get("id");
  const q = supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("user_id", user.id).is("read_at", null);
  if (typeof id === "string" && id) await q.eq("id", id);
  else await q;
  revalidatePath("/notifications");
  revalidatePath("/", "layout");
}
