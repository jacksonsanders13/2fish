import type { Metadata } from "next";
import { Dashboard } from "@/components/app/dashboard";
import { AppShell } from "@/components/app/shell";
import { fallbackIntro, getOpenTasks, getOrCreateConversation } from "@/lib/agent/store";
import { ensureBusiness, getDashboard } from "@/lib/app/queries";
import { smsConfigured } from "@/lib/integrations/sms";

export const metadata: Metadata = { title: "Your consultant" };

export default async function DashboardPage() {
  const { supabase, user, business } = await ensureBusiness();
  const [data, convo, tasks] = await Promise.all([
    getDashboard(smsConfigured()),
    getOrCreateConversation(supabase, user.id, business.id),
    getOpenTasks(supabase, business.id),
  ]);
  const agentReady = Boolean(process.env.ANTHROPIC_API_KEY);
  const intro = fallbackIntro(Boolean(data.plan), data.plan?.totalMonthly ?? 0, data.plan?.steps[0]?.title.toLowerCase());

  return (
    <AppShell active="dashboard" email={data.email}>
      <Dashboard data={data} messages={convo.messages} tasks={tasks} agentReady={agentReady} intro={intro} userId={user.id} />
    </AppShell>
  );
}
