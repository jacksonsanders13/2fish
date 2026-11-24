import type { Metadata } from "next";
import { ReportView } from "@/components/app/report";
import { AppShell, PageBody } from "@/components/app/shell";
import { ensureBusiness } from "@/lib/app/queries";
import { addDays, mondayOf } from "@/lib/pilot/dates";
import { getReport, salesByWeek } from "@/lib/pilot/queries";

export const metadata: Metadata = { title: "Report" };

export default async function ReportPage({ searchParams }: { searchParams: Promise<{ month?: string }> }) {
  const { supabase, user, business } = await ensureBusiness();
  const { month } = await searchParams;
  const data = await getReport(month);
  // Every week that starts in the report month.
  const first = `${data.month}-01`;
  const firstWeek = first === mondayOf(first) ? first : addDays(mondayOf(first), 7);
  const lastDay = addDays(addDays(first, 32).slice(0, 7) + "-01", -1);
  const count = Math.max(1, Math.floor((Date.parse(lastDay) - Date.parse(firstWeek)) / 6048e5) + 1);
  const split = await salesByWeek(supabase, business.id, firstWeek, count, data.today);
  return (
    <AppShell active="report" email={user.email ?? ""}>
      <PageBody>
        <ReportView key={data.month} data={data} split={split} />
      </PageBody>
    </AppShell>
  );
}
