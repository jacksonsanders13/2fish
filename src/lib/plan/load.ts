import type { Leak, StepStatus } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";

export type SavedStep = {
  id: string;
  rank: number;
  key: string;
  title: string;
  detail: string;
  impact: number;
  status: StepStatus;
  href: string;
};

export type SavedPlan = {
  id: string;
  createdAt: string;
  totalMonthly: number;
  leaks: Leak[];
  summary: string | null;
  steps: SavedStep[];
  business: { id: string; name: string; kind: string };
};

/** The signed-in owner's most recent plan, or null if they haven't run an audit. */
export async function loadLatestPlan(): Promise<{ email: string; plan: SavedPlan | null } | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: plan } = await supabase
    .from("plans")
    .select("id, created_at, total_monthly, leaks, summary, businesses(id, name, kind)")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!plan) return { email: user.email ?? "", plan: null };

  const { data: steps } = await supabase
    .from("plan_steps")
    .select("id, rank, key, title, detail, impact_monthly, status, href")
    .eq("plan_id", plan.id)
    .order("rank");

  const biz = Array.isArray(plan.businesses) ? plan.businesses[0] : plan.businesses;

  return {
    email: user.email ?? "",
    plan: {
      id: plan.id,
      createdAt: plan.created_at,
      totalMonthly: plan.total_monthly,
      leaks: plan.leaks as Leak[],
      summary: plan.summary,
      steps: (steps ?? []).map((s) => ({
        id: s.id,
        rank: s.rank,
        key: s.key,
        title: s.title,
        detail: s.detail,
        impact: s.impact_monthly,
        status: s.status as StepStatus,
        href: s.href,
      })),
      business: biz ?? { id: "", name: "", kind: "" },
    },
  };
}
