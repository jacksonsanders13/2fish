import type { Metadata } from "next";
import { Dashboard, type AgentSummary } from "@/components/app/dashboard";
import { AppShell } from "@/components/app/shell";
import { fallbackIntro, getOpenTasks, getOrCreateConversation } from "@/lib/agent/store";
import { ensureBusiness, getDashboard } from "@/lib/app/queries";
import { smsConfigured } from "@/lib/integrations/sms";
import { addDays, mondayOf, packWeek, todayIn } from "@/lib/pilot/dates";
import { learnings, scorePosts } from "@/lib/pilot/scores";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const { supabase, user, business } = await ensureBusiness();
  const today = todayIn(business.timezone);
  const thisWeek = mondayOf(today);

  const [data, convo, tasks, weekPosts, scores] = await Promise.all([
    getDashboard(smsConfigured()),
    getOrCreateConversation(supabase, user.id, business.id),
    getOpenTasks(supabase, business.id),
    supabase.from("posts").select("week_of, status").eq("business_id", business.id).in("week_of", [thisWeek, packWeek(today)]),
    scorePosts(supabase, business.id, addDays(thisWeek, -56), today),
  ]);

  // The week the owner should be looking at: the coming pack if it exists, else this one.
  const rows = weekPosts.data ?? [];
  const next = packWeek(today);
  const focus = rows.some((r) => r.week_of === next) ? next : thisWeek;
  const inFocus = rows.filter((r) => r.week_of === focus);
  const month = today.slice(0, 7);
  const monthScores = scores.filter((s) => s.weekOf.slice(0, 7) === month);
  const best = [...scores].filter((s) => !s.partial).sort((a, b) => b.extraDollars - a.extraDollars)[0];

  const agent: AgentSummary = {
    weekOf: focus,
    total: inFocus.length,
    approved: inFocus.filter((r) => r.status !== "draft").length,
    posted: inFocus.filter((r) => r.status === "posted").length,
    square: data.setup.square,
    monthExtra: monthScores.reduce((s, x) => s + Math.max(0, x.extraDollars), 0),
    learned: learnings(scores).summary,
    best: best && best.extraDollars > 0 ? { title: best.title, extra: best.extraDollars } : null,
  };

  const agentReady = Boolean(process.env.ANTHROPIC_API_KEY);
  const intro = fallbackIntro(Boolean(data.plan), data.plan?.totalMonthly ?? 0, data.plan?.steps[0]?.title.toLowerCase());

  return (
    <AppShell active="dashboard" email={data.email}>
      <Dashboard data={data} agent={agent} messages={convo.messages} tasks={tasks} agentReady={agentReady} intro={intro} userId={user.id} />
    </AppShell>
  );
}
