import type { Metadata } from "next";
import { cookies } from "next/headers";
import { DemoDashboard } from "@/components/app/demo-dashboard";
import { AppShell } from "@/components/app/shell";
import { addDays, mondayOf, todayIn } from "@/lib/pilot/dates";

export const metadata: Metadata = { title: "Dashboard (test drive)", robots: { index: false } };

// The test drive dashboard. People reach it from /demo; the proxy sends signed-out
// visitors with the demo cookie here when they open /dashboard. No account, no database.
export default async function DemoDashboardPage({ searchParams }: { searchParams: Promise<{ month?: string; soon?: string }> }) {
  const { month, soon } = await searchParams;
  const jar = await cookies();
  const name = decodeURIComponent(jar.get("2fish_demo_store")?.value ?? "").slice(0, 60) || "Your store";
  const today = todayIn("America/New_York");

  const ym = month && /^\d{4}-\d{2}$/.test(month) ? month : today.slice(0, 7);
  const first = `${ym}-01`;
  const nextMonth = addDays(first, 32).slice(0, 7) + "-01";
  const lastMonday = addDays(mondayOf(today), -7);
  const frame = {
    month: ym,
    gridStart: mondayOf(first),
    gridEnd: addDays(mondayOf(addDays(nextMonth, -1)), 6),
    weeks: [],
    // Empty days plus hasSales false shows the labeled sample week, same as a
    // real store before it connects Square.
    days: Array.from({ length: 7 }, (_, i) => ({ day: addDays(lastMonday, i), total: 0, posted: 0 })),
    hasSales: false,
  };

  const data = {
    email: "test drive",
    business: { id: "demo", name, kind: "boutique", phone: "", city: "Raleigh", timezone: "America/New_York" },
    plan: { id: "demo", createdAt: today, totalMonthly: 0, leaks: [], summary: null, steps: [], business: { id: "demo", name, kind: "boutique" } },
    recovered: { month: 0, monthJobs: 0, allTime: 0 },
    stats: { textedBack: 0, customers: 0, conversations: 0 },
    events: [],
    smsConfigured: false,
    setup: { square: false, posts: true },
  };

  return (
    <AppShell active="dashboard" email={data.email}>
      <DemoDashboard data={data} frame={frame} today={today} soon={soon} />
    </AppShell>
  );
}
