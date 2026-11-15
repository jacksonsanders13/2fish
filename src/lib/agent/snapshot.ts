import type { SupabaseClient } from "@supabase/supabase-js";
import type { Business } from "@/lib/app/types";

// Everything the consultant should know about this business before it speaks.
// Built fresh for every turn so it never argues with the dashboard.

export type Task = {
  id: string;
  kind: string;
  status: string;
  title: string;
  payload: Record<string, unknown>;
  result: Record<string, unknown>;
  createdAt: string;
};

export type Snapshot = {
  business: Business;
  plan: {
    id: string;
    totalMonthly: number;
    summary: string | null;
    steps: { id: string; key: string; rank: number; title: string; detail: string; status: string; impact: number; settings: Record<string, unknown> }[];
    leaks: { id: string; title: string; perMonth: number; short: string }[];
  } | null;
  audit: Record<string, string> | null;
  recovered: { month: number; monthJobs: number };
  customers: number;
  textback: { enabled: boolean; template: string; hoursStart: number; hoursEnd: number } | null;
  tasks: Task[];
  recentEvents: string[];
  integrations: { sms: boolean; video: boolean };
};

export async function buildSnapshot(
  supabase: SupabaseClient,
  business: Business,
  integrations: { sms: boolean; video: boolean },
): Promise<Snapshot> {
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10);

  const [plan, jobs, customers, textback, tasks, events] = await Promise.all([
    supabase
      .from("plans")
      .select("id, total_monthly, summary, leaks, audit_id")
      .eq("business_id", business.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase.from("jobs").select("value").eq("business_id", business.id).gte("won_at", monthStart),
    supabase.from("customers").select("id", { count: "exact", head: true }).eq("business_id", business.id),
    supabase.from("textback_settings").select("*").eq("business_id", business.id).maybeSingle(),
    supabase
      .from("agent_tasks")
      .select("*")
      .eq("business_id", business.id)
      .in("status", ["waiting_on_owner", "queued", "running"])
      .order("created_at", { ascending: false })
      .limit(10),
    supabase.from("events").select("text, created_at").eq("business_id", business.id).order("created_at", { ascending: false }).limit(8),
  ]);

  let steps: Snapshot["plan"] extends infer P ? (P extends { steps: infer S } ? S : never) : never = [];
  let audit: Record<string, string> | null = null;
  if (plan.data) {
    const [s, a] = await Promise.all([
      supabase.from("plan_steps").select("id, key, rank, title, detail, status, impact_monthly, settings").eq("plan_id", plan.data.id).order("rank"),
      supabase.from("audits").select("answers").eq("id", plan.data.audit_id).maybeSingle(),
    ]);
    steps = (s.data ?? []).map((r) => ({
      id: r.id,
      key: r.key,
      rank: r.rank,
      title: r.title,
      detail: r.detail,
      status: r.status,
      impact: r.impact_monthly,
      settings: (r.settings as Record<string, unknown>) ?? {},
    }));
    audit = (a.data?.answers as Record<string, string>) ?? null;
  }

  return {
    business,
    plan: plan.data
      ? {
          id: plan.data.id,
          totalMonthly: plan.data.total_monthly,
          summary: plan.data.summary,
          steps,
          leaks: (plan.data.leaks as Snapshot["plan"] extends infer P ? (P extends { leaks: infer L } ? L : never) : never) ?? [],
        }
      : null,
    audit,
    recovered: { month: (jobs.data ?? []).reduce((s, j) => s + j.value, 0), monthJobs: (jobs.data ?? []).length },
    customers: customers.count ?? 0,
    textback: textback.data
      ? { enabled: textback.data.enabled, template: textback.data.template, hoursStart: textback.data.hours_start, hoursEnd: textback.data.hours_end }
      : null,
    tasks: (tasks.data ?? []).map((t) => ({
      id: t.id,
      kind: t.kind,
      status: t.status,
      title: t.title,
      payload: (t.payload as Record<string, unknown>) ?? {},
      result: (t.result as Record<string, unknown>) ?? {},
      createdAt: t.created_at,
    })),
    recentEvents: (events.data ?? []).map((e) => e.text),
    integrations,
  };
}

export function describeSnapshot(s: Snapshot) {
  const lines: string[] = [];
  const b = s.business;
  lines.push(`Business: ${b.name || "(no name yet)"} · ${b.kind} · ${b.city || "city unknown"} · phone ${b.phone || "unknown"}.`);
  if (s.plan) {
    lines.push(`Plan: losing about $${s.plan.totalMonthly.toLocaleString()} a month. Leaks: ${s.plan.leaks.map((l) => `${l.title} $${l.perMonth.toLocaleString()}/mo`).join("; ")}.`);
    lines.push("Steps:");
    for (const st of s.plan.steps) {
      const settings = Object.keys(st.settings).length ? ` settings=${JSON.stringify(st.settings)}` : "";
      lines.push(`  ${st.rank}. [${st.key}] ${st.title} — status ${st.status}, worth about $${st.impact.toLocaleString()}/mo.${settings} ${st.detail}`);
    }
  } else {
    lines.push("Plan: none yet. The owner has not finished the audit.");
  }
  if (s.audit) lines.push(`Audit answers: ${Object.entries(s.audit).map(([k, v]) => `${k}=${v}`).join(", ")}.`);
  lines.push(`Recovered this month: $${s.recovered.month.toLocaleString()} from ${s.recovered.monthJobs} logged jobs. Customers on file: ${s.customers}.`);
  lines.push(
    s.textback
      ? `Text-back: ${s.textback.enabled ? "ON" : "OFF"}, hours ${s.textback.hoursStart}:00 to ${s.textback.hoursEnd}:00, first message: "${s.textback.template}".`
      : "Text-back: not set up yet.",
  );
  lines.push(`Integrations: texting ${s.integrations.sms ? "connected" : "NOT connected (texts are queued, not sent)"}; video renderer ${s.integrations.video ? "connected" : "NOT connected (video batches are queued)"}.`);
  if (s.tasks.length) lines.push(`Open tasks: ${s.tasks.map((t) => `${t.kind} (${t.status}): ${t.title}`).join("; ")}.`);
  if (s.recentEvents.length) lines.push(`Recent activity: ${s.recentEvents.slice(0, 5).join(" | ")}`);
  return lines.join("\n");
}
