import type { Metadata } from "next";
import { Dashboard } from "@/components/app/dashboard";
import { AppShell } from "@/components/app/shell";
import { fallbackIntro, getOpenTasks, listConversations, loadConversation } from "@/lib/agent/store";
import { ensureBusiness, getDashboard } from "@/lib/app/queries";
import { smsConfigured } from "@/lib/integrations/sms";
import { todayIn } from "@/lib/pilot/dates";
import { getHome } from "@/lib/pilot/queries";
import { claudeKey } from "@/lib/ai-key";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ month?: string; chat?: string }> }) {
  const { month, chat } = await searchParams;
  const { supabase, user, business } = await ensureBusiness();
  const today = todayIn(business.timezone);

  const [data, chats, tasks, home] = await Promise.all([
    getDashboard(smsConfigured()),
    listConversations(supabase, business.id),
    getOpenTasks(supabase, business.id),
    getHome(supabase, business.id, today, month),
  ]);

  // Open the chat in the link, or the most recent one. "?chat=new" starts fresh.
  const wanted = chat === "new" ? null : chat && /^[0-9a-f-]{36}$/i.test(chat) ? chat : chats[0]?.id;
  const convo = wanted ? await loadConversation(supabase, business.id, wanted) : null;

  const agentReady = Boolean(claudeKey());
  const intro = fallbackIntro(Boolean(data.plan), data.plan?.totalMonthly ?? 0, data.plan?.steps[0]?.title.toLowerCase());

  return (
    <AppShell active="dashboard" email={data.email}>
      <Dashboard data={data} home={home} today={today} messages={convo?.messages ?? []} chats={chats} conversationId={convo?.conversationId ?? null} firstEver={chats.length === 0} tasks={tasks} agentReady={agentReady} intro={intro} userId={user.id} />
    </AppShell>
  );
}
