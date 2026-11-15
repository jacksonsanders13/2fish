import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { loadLatestPlan, type SavedPlan } from "@/lib/plan/load";
import type { AppEvent, Business, Conversation, Customer, Job, Message, TextbackSettings } from "./types";
import { defaultTemplate } from "./types";

export async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard");
  return { supabase, user };
}

function mapBusiness(b: Record<string, unknown>): Business {
  return {
    id: String(b.id),
    name: String(b.name ?? ""),
    kind: String(b.kind ?? ""),
    phone: String(b.phone ?? ""),
    city: String(b.city ?? ""),
    timezone: String(b.timezone ?? "America/New_York"),
  };
}

/** The owner's business row, created on first use if they signed in without an audit. */
export async function ensureBusiness() {
  const { supabase, user } = await requireUser();
  // Oldest row wins. The unique index on owner_id keeps it to one, but two
  // first requests can still race, so the insert falls back to a re-read.
  const existing = await supabase.from("businesses").select("*").eq("owner_id", user.id).order("created_at").limit(1).maybeSingle();
  if (existing.data) return { supabase, user, business: mapBusiness(existing.data) };
  const created = await supabase.from("businesses").insert({ owner_id: user.id, kind: "Something else" }).select("*").single();
  if (created.data) return { supabase, user, business: mapBusiness(created.data) };
  const again = await supabase.from("businesses").select("*").eq("owner_id", user.id).order("created_at").limit(1).single();
  if (again.error) throw again.error;
  return { supabase, user, business: mapBusiness(again.data) };
}

function monthStart() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
}

export type DashboardData = {
  email: string;
  business: Business;
  plan: SavedPlan | null;
  recovered: { month: number; monthJobs: number; allTime: number };
  stats: { textedBack: number; customers: number; conversations: number };
  events: AppEvent[];
  smsConfigured: boolean;
};

export async function getDashboard(smsConfigured: boolean): Promise<DashboardData> {
  const { supabase, user, business } = await ensureBusiness();
  const planData = await loadLatestPlan();
  const since = monthStart();

  const [jobsRes, allJobsRes, textedRes, customersRes, convRes, eventsRes] = await Promise.all([
    supabase.from("jobs").select("value").eq("business_id", business.id).gte("won_at", since),
    supabase.from("jobs").select("value").eq("business_id", business.id),
    supabase.from("messages").select("id", { count: "exact", head: true }).eq("business_id", business.id).eq("direction", "out"),
    supabase.from("customers").select("id", { count: "exact", head: true }).eq("business_id", business.id),
    supabase.from("messages").select("phone").eq("business_id", business.id),
    supabase.from("events").select("id, kind, text, created_at").eq("business_id", business.id).order("created_at", { ascending: false }).limit(8),
  ]);

  const monthJobs = jobsRes.data ?? [];
  return {
    email: user.email ?? "",
    business,
    plan: planData?.plan ?? null,
    recovered: {
      month: monthJobs.reduce((s, j) => s + j.value, 0),
      monthJobs: monthJobs.length,
      allTime: (allJobsRes.data ?? []).reduce((s, j) => s + j.value, 0),
    },
    stats: {
      textedBack: textedRes.count ?? 0,
      customers: customersRes.count ?? 0,
      conversations: new Set((convRes.data ?? []).map((m) => m.phone)).size,
    },
    events: (eventsRes.data ?? []).map((e) => ({ id: e.id, kind: e.kind, text: e.text, createdAt: e.created_at })),
    smsConfigured,
  };
}

export async function getCustomers(): Promise<{ business: Business; customers: Customer[]; jobs: Job[] }> {
  const { supabase, business } = await ensureBusiness();
  const [c, j] = await Promise.all([
    supabase.from("customers").select("*").eq("business_id", business.id).order("created_at", { ascending: false }),
    supabase.from("jobs").select("*").eq("business_id", business.id).order("won_at", { ascending: false }).limit(50),
  ]);
  return {
    business,
    customers: (c.data ?? []).map((r) => ({
      id: r.id,
      name: r.name,
      phone: r.phone,
      email: r.email,
      lastJobAt: r.last_job_at,
      lastJobValue: r.last_job_value,
      smsConsent: r.sms_consent,
      source: r.source,
      createdAt: r.created_at,
    })),
    jobs: (j.data ?? []).map((r) => ({
      id: r.id,
      customerId: r.customer_id,
      value: r.value,
      wonAt: r.won_at,
      sourceStep: r.source_step,
      note: r.note,
    })),
  };
}

export async function getTextback(): Promise<{
  business: Business;
  settings: TextbackSettings;
  conversations: Conversation[];
}> {
  const { supabase, business } = await ensureBusiness();
  const [s, m, c] = await Promise.all([
    supabase.from("textback_settings").select("*").eq("business_id", business.id).maybeSingle(),
    supabase.from("messages").select("*").eq("business_id", business.id).order("created_at", { ascending: true }).limit(500),
    supabase.from("customers").select("id, name, phone").eq("business_id", business.id),
  ]);

  const settings: TextbackSettings = s.data
    ? {
        enabled: s.data.enabled,
        forwardNumber: s.data.forward_number,
        template: s.data.template || defaultTemplate(business.name),
        hoursStart: s.data.hours_start,
        hoursEnd: s.data.hours_end,
        delaySeconds: s.data.delay_seconds,
      }
    : { enabled: false, forwardNumber: business.phone, template: defaultTemplate(business.name), hoursStart: 8, hoursEnd: 21, delaySeconds: 10 };

  const byPhone = new Map<string, { id: string; name: string }>();
  for (const row of c.data ?? []) byPhone.set(row.phone, { id: row.id, name: row.name });

  const groups = new Map<string, Message[]>();
  for (const row of m.data ?? []) {
    const msg: Message = { id: row.id, phone: row.phone, direction: row.direction, body: row.body, status: row.status, createdAt: row.created_at };
    groups.set(row.phone, [...(groups.get(row.phone) ?? []), msg]);
  }
  const conversations: Conversation[] = [...groups.entries()]
    .map(([phone, messages]) => ({
      phone,
      customerName: byPhone.get(phone)?.name ?? null,
      customerId: byPhone.get(phone)?.id ?? null,
      last: messages[messages.length - 1],
      messages,
    }))
    .sort((a, b) => (a.last.createdAt < b.last.createdAt ? 1 : -1));

  return { business, settings, conversations };
}

export async function getSettings() {
  const { user, business } = await ensureBusiness();
  return { email: user.email ?? "", business };
}
