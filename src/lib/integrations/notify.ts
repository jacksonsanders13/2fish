import type { SupabaseClient } from "@supabase/supabase-js";
import { normalizePhone } from "@/lib/app/types";
import { sendSms, withinHours } from "./sms";

export function siteUrl() {
  return (process.env.SITE_URL ?? "https://join2fish.vercel.app").replace(/\/$/, "");
}

// Texts the store owner at the mobile number in Settings. Only between 8am and
// 9pm their time, and every text says how to stop. Twilio handles STOP replies.
export async function textOwner(admin: SupabaseClient, businessId: string, body: string) {
  const { data: biz } = await admin.from("businesses").select("phone, timezone").eq("id", businessId).single();
  const to = normalizePhone(String(biz?.phone ?? ""));
  if (!to) return { status: "skipped" as const, why: "no mobile number" };
  if (!withinHours(8, 21, (biz?.timezone as string) || "America/New_York")) return { status: "skipped" as const, why: "quiet hours" };
  return sendSms(to, `2fish: ${body} Reply STOP to stop texts.`);
}
