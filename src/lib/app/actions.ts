"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { sendSms, smsConfigured, withinHours } from "@/lib/integrations/sms";
import { passwordSchema } from "@/lib/plan/schema";
import { ensureBusiness } from "./queries";
import { BUSINESS_KINDS, defaultTemplate, normalizePhone } from "./types";

type Result = { ok: true; message?: string } | { ok: false; message: string };

function fail(e: unknown): Result {
  if (e instanceof z.ZodError) return { ok: false, message: e.issues[0]?.message ?? "Check the form." };
  return { ok: false, message: e instanceof Error ? e.message : "Something went wrong." };
}

async function logEvent(businessId: string, ownerId: string, kind: string, text: string) {
  const { supabase } = await ensureBusiness();
  await supabase.from("events").insert({ business_id: businessId, owner_id: ownerId, kind, text });
}

function refresh() {
  revalidatePath("/dashboard", "layout");
}

/* ---------------- Customers ---------------- */

const customerSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(80),
  phone: z.string().trim().max(30),
  email: z.string().trim().email().max(120).or(z.literal("")),
  lastJobAt: z.string().max(10).optional(),
  lastJobValue: z.coerce.number().int().min(0).max(1_000_000).optional(),
  smsConsent: z.boolean().optional(),
});

export async function addCustomer(input: z.input<typeof customerSchema>): Promise<Result> {
  try {
    const c = customerSchema.parse(input);
    const { supabase, user, business } = await ensureBusiness();
    const { error } = await supabase.from("customers").insert({
      business_id: business.id,
      owner_id: user.id,
      name: c.name,
      phone: normalizePhone(c.phone),
      email: c.email,
      last_job_at: c.lastJobAt || null,
      last_job_value: c.lastJobValue ?? null,
      sms_consent: Boolean(c.smsConsent),
    });
    if (error) throw error;
    await logEvent(business.id, user.id, "customer", `Added ${c.name} to customers.`);
    refresh();
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function importCustomers(rows: z.input<typeof customerSchema>[]): Promise<Result> {
  try {
    const parsed = z.array(customerSchema).max(500, "Import up to 500 at a time.").parse(rows);
    const { supabase, user, business } = await ensureBusiness();
    const { error } = await supabase.from("customers").insert(
      parsed.map((c) => ({
        business_id: business.id,
        owner_id: user.id,
        name: c.name,
        phone: normalizePhone(c.phone),
        email: c.email,
        last_job_at: c.lastJobAt || null,
        last_job_value: c.lastJobValue ?? null,
        sms_consent: Boolean(c.smsConsent),
        source: "import",
      })),
    );
    if (error) throw error;
    await logEvent(business.id, user.id, "customer", `Imported ${parsed.length} customers from a file.`);
    refresh();
    return { ok: true, message: `Imported ${parsed.length} customers.` };
  } catch (e) {
    return fail(e);
  }
}

export async function deleteCustomer(id: string): Promise<Result> {
  try {
    const { supabase } = await ensureBusiness();
    const { error } = await supabase.from("customers").delete().eq("id", z.string().uuid().parse(id));
    if (error) throw error;
    refresh();
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

/* ---------------- Jobs (this is where "recovered" comes from) ---------------- */

const jobSchema = z.object({
  value: z.coerce.number().int().min(1, "Enter the job value.").max(1_000_000),
  customerId: z.string().uuid().optional().or(z.literal("")),
  sourceStep: z.string().max(20).optional(),
  note: z.string().trim().max(200).optional(),
  wonAt: z.string().max(10).optional(),
});

export async function logJob(input: z.input<typeof jobSchema>): Promise<Result> {
  try {
    const j = jobSchema.parse(input);
    const { supabase, user, business } = await ensureBusiness();
    const { error } = await supabase.from("jobs").insert({
      business_id: business.id,
      owner_id: user.id,
      customer_id: j.customerId || null,
      value: j.value,
      won_at: j.wonAt || new Date().toISOString().slice(0, 10),
      source_step: j.sourceStep && j.sourceStep !== "other" ? j.sourceStep : null,
      note: j.note ?? "",
    });
    if (error) throw error;
    if (j.customerId) {
      await supabase
        .from("customers")
        .update({ last_job_at: j.wonAt || new Date().toISOString().slice(0, 10), last_job_value: j.value })
        .eq("id", j.customerId);
    }
    const from = j.sourceStep && j.sourceStep !== "other" ? ` from ${j.sourceStep.replace("-", " ")}` : "";
    await logEvent(business.id, user.id, "job", `Job won${from}: $${j.value.toLocaleString()}${j.note ? `. ${j.note}` : ""}`);
    refresh();
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

/* ---------------- Missed-call text-back ---------------- */

const textbackSchema = z.object({
  forwardNumber: z.string().trim().max(30),
  template: z.string().trim().min(10, "The first message needs a few more words.").max(320),
  hoursStart: z.coerce.number().int().min(0).max(23),
  hoursEnd: z.coerce.number().int().min(1).max(24),
  delaySeconds: z.coerce.number().int().min(5).max(120),
});

export async function saveTextbackSettings(input: z.input<typeof textbackSchema>): Promise<Result> {
  try {
    const s = textbackSchema.parse(input);
    if (s.hoursEnd <= s.hoursStart) return { ok: false, message: "Texting hours need to end after they start." };
    const { supabase, user, business } = await ensureBusiness();
    const { error } = await supabase.from("textback_settings").upsert({
      business_id: business.id,
      owner_id: user.id,
      forward_number: normalizePhone(s.forwardNumber),
      template: s.template,
      hours_start: s.hoursStart,
      hours_end: s.hoursEnd,
      delay_seconds: s.delaySeconds,
      updated_at: new Date().toISOString(),
    });
    if (error) throw error;
    await logEvent(business.id, user.id, "setting", "Text-back settings saved.");
    refresh();
    return { ok: true, message: "Saved." };
  } catch (e) {
    return fail(e);
  }
}

export async function setTextbackEnabled(enabled: boolean): Promise<Result> {
  try {
    const { supabase, user, business } = await ensureBusiness();
    const existing = await supabase.from("textback_settings").select("business_id").eq("business_id", business.id).maybeSingle();
    const row = existing.data
      ? await supabase.from("textback_settings").update({ enabled, updated_at: new Date().toISOString() }).eq("business_id", business.id)
      : await supabase.from("textback_settings").insert({
          business_id: business.id,
          owner_id: user.id,
          enabled,
          forward_number: business.phone,
          template: defaultTemplate(business.name),
        });
    if (row.error) throw row.error;
    await supabase.from("plan_steps").update({ status: enabled ? "live" : "needs-you", updated_at: new Date().toISOString() }).eq("owner_id", user.id).eq("key", "text-back");
    await logEvent(business.id, user.id, "setting", enabled ? "Missed-call text-back turned on." : "Missed-call text-back turned off.");
    refresh();
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

/**
 * Until Twilio is listening to the real phone line, the owner logs a missed
 * call by hand and 2fish sends (or queues) the first text.
 */
export async function logMissedCall(input: { phone: string; name?: string }): Promise<Result> {
  try {
    const phone = normalizePhone(z.string().trim().min(7, "Enter the caller's number.").parse(input.phone));
    if (!phone) return { ok: false, message: "Enter the caller's number." };
    const { supabase, user, business } = await ensureBusiness();

    const name = (input.name ?? "").trim().slice(0, 80);
    let customerId: string | null = null;
    const existing = await supabase.from("customers").select("id").eq("business_id", business.id).eq("phone", phone).maybeSingle();
    if (existing.data) customerId = existing.data.id;
    else if (name) {
      const made = await supabase
        .from("customers")
        .insert({ business_id: business.id, owner_id: user.id, name, phone, source: "missed-call", sms_consent: true })
        .select("id")
        .single();
      customerId = made.data?.id ?? null;
    }

    await supabase.from("messages").insert({ business_id: business.id, owner_id: user.id, customer_id: customerId, phone, direction: "missed-call", body: "", status: "logged" });

    const s = await supabase.from("textback_settings").select("*").eq("business_id", business.id).maybeSingle();
    if (!s.data?.enabled) {
      await logEvent(business.id, user.id, "call", `Missed call from ${phone} logged. Text-back is off, so nothing was sent.`);
      refresh();
      return { ok: true, message: "Logged. Turn text-back on to send the first message automatically." };
    }

    const body = s.data.template || defaultTemplate(business.name);
    const inHours = withinHours(s.data.hours_start, s.data.hours_end, business.timezone);
    const result = inHours ? await sendSms(phone, body) : { status: "queued" as const };
    await supabase.from("messages").insert({
      business_id: business.id,
      owner_id: user.id,
      customer_id: customerId,
      phone,
      direction: "out",
      body,
      status: result.status,
      provider_id: result.providerId ?? null,
    });
    const why = !inHours ? "outside texting hours, queued" : result.status === "sent" ? "sent" : result.status === "queued" ? "queued until texting is connected" : `failed: ${result.error}`;
    await logEvent(business.id, user.id, "message", `Missed call from ${phone}. First text ${why}.`);
    refresh();
    return { ok: true, message: `Logged. First text ${why}.` };
  } catch (e) {
    return fail(e);
  }
}

export async function sendReply(input: { phone: string; body: string }): Promise<Result> {
  try {
    const phone = normalizePhone(z.string().min(7).parse(input.phone));
    const body = z.string().trim().min(1, "Type a message.").max(640).parse(input.body);
    const { supabase, user, business } = await ensureBusiness();
    const result = await sendSms(phone, body);
    const { error } = await supabase.from("messages").insert({
      business_id: business.id,
      owner_id: user.id,
      phone,
      direction: "out",
      body,
      status: result.status,
      provider_id: result.providerId ?? null,
    });
    if (error) throw error;
    refresh();
    return result.status === "failed" ? { ok: false, message: result.error ?? "Could not send." } : { ok: true };
  } catch (e) {
    return fail(e);
  }
}

/** Lets the dashboard tell the owner whether real texting is on. */
export async function textingStatus() {
  return { configured: smsConfigured() };
}

/* ---------------- Settings ---------------- */

const businessSchema = z.object({
  name: z.string().trim().max(80),
  kind: z.string().refine((k) => BUSINESS_KINDS.includes(k), "Pick a business type."),
  phone: z.string().trim().max(30),
  city: z.string().trim().max(80),
});

export async function updateBusiness(input: z.input<typeof businessSchema>): Promise<Result> {
  try {
    const b = businessSchema.parse(input);
    const { supabase, business } = await ensureBusiness();
    const { error } = await supabase
      .from("businesses")
      .update({ name: b.name, kind: b.kind, phone: normalizePhone(b.phone), city: b.city })
      .eq("id", business.id);
    if (error) throw error;
    refresh();
    return { ok: true, message: "Saved." };
  } catch (e) {
    return fail(e);
  }
}

export async function changePassword(input: { password: string }): Promise<Result> {
  try {
    const password = passwordSchema.parse(input.password);
    const { supabase } = await ensureBusiness();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
    return { ok: true, message: "Password changed." };
  } catch (e) {
    return fail(e);
  }
}

export async function deleteAccount(confirm: string) {
  if (confirm !== "DELETE") return { ok: false as const, message: 'Type DELETE to confirm.' };
  const { supabase } = await ensureBusiness();
  const { error } = await supabase.rpc("delete_my_account");
  if (error) return { ok: false as const, message: error.message };
  await supabase.auth.signOut();
  redirect("/");
}
