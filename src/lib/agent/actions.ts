"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ensureBusiness } from "@/lib/app/queries";
import { sendSms } from "@/lib/integrations/sms";

type Result = { ok: true; message?: string } | { ok: false; message: string };

/** Owner taps Approve on a drafted text. This is the only path that sends. */
export async function approveText(taskId: string): Promise<Result> {
  const { supabase, user, business } = await ensureBusiness();
  const { data: task } = await supabase.from("agent_tasks").select("*").eq("id", z.string().uuid().parse(taskId)).eq("kind", "send_text").maybeSingle();
  if (!task || task.status !== "waiting_on_owner") return { ok: false, message: "That draft is gone or already handled." };
  const p = task.payload as { phone: string; body: string; name?: string; purpose?: string };

  const result = await sendSms(p.phone, p.body);
  await supabase.from("messages").insert({
    business_id: business.id,
    owner_id: user.id,
    phone: p.phone,
    direction: "out",
    body: p.body,
    status: result.status,
    provider_id: result.providerId ?? null,
  });
  await supabase
    .from("agent_tasks")
    .update({ status: result.status === "failed" ? "failed" : "done", result: { status: result.status, error: result.error ?? null }, updated_at: new Date().toISOString() })
    .eq("id", task.id);
  await supabase.from("events").insert({
    business_id: business.id,
    owner_id: user.id,
    kind: "message",
    text: `Text to ${p.name || p.phone} ${result.status === "sent" ? "sent" : result.status === "queued" ? "approved and queued until texting is connected" : `failed: ${result.error}`}.`,
  });
  revalidatePath("/dashboard", "layout");
  return result.status === "failed" ? { ok: false, message: result.error ?? "Could not send." } : { ok: true, message: result.status === "sent" ? "Sent." : "Approved. It goes out as soon as texting is connected." };
}

export async function dismissTask(taskId: string): Promise<Result> {
  const { supabase } = await ensureBusiness();
  const { error } = await supabase.from("agent_tasks").update({ status: "dismissed", updated_at: new Date().toISOString() }).eq("id", z.string().uuid().parse(taskId));
  revalidatePath("/dashboard", "layout");
  return error ? { ok: false, message: error.message } : { ok: true };
}

/** Called after the browser uploaded clips to storage for a clips_request task. */
export async function clipsUploaded(taskId: string, paths: string[]): Promise<Result> {
  const { supabase, user, business } = await ensureBusiness();
  const id = z.string().uuid().parse(taskId);
  const clean = z.array(z.string().min(1)).min(1).max(30).parse(paths).filter((p) => p.startsWith(`${user.id}/`));
  if (clean.length === 0) return { ok: false, message: "No clips found." };
  const { error } = await supabase
    .from("agent_tasks")
    .update({ status: "done", result: { paths: clean }, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("kind", "clips_request");
  if (error) return { ok: false, message: error.message };
  await supabase.from("events").insert({ business_id: business.id, owner_id: user.id, kind: "video", text: `${clean.length} clips uploaded.` });
  revalidatePath("/dashboard", "layout");
  return { ok: true, message: `${clean.length} clips uploaded.` };
}
