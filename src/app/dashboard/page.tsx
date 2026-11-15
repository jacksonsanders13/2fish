import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Dashboard } from "@/components/app/dashboard";
import { loadLatestPlan } from "@/lib/plan/load";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const data = await loadLatestPlan();
  if (!data) redirect("/login?next=/dashboard");
  return <Dashboard email={data.email} plan={data.plan} />;
}
