import type { Metadata } from "next";
import { Dashboard } from "@/components/app/dashboard";
import { getDashboard } from "@/lib/app/queries";
import { smsConfigured } from "@/lib/integrations/sms";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const data = await getDashboard(smsConfigured());
  return <Dashboard data={data} />;
}
