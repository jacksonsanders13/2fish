import type { Metadata } from "next";
import { ReportView } from "@/components/app/report";
import { AppShell, PageBody } from "@/components/app/shell";
import { requireUser } from "@/lib/app/queries";
import { getReport } from "@/lib/pilot/queries";

export const metadata: Metadata = { title: "Report" };

export default async function ReportPage({ searchParams }: { searchParams: Promise<{ month?: string }> }) {
  const { user } = await requireUser();
  const { month } = await searchParams;
  const data = await getReport(month);
  return (
    <AppShell active="report" email={user.email ?? ""}>
      <PageBody>
        <ReportView key={data.month} data={data} />
      </PageBody>
    </AppShell>
  );
}
