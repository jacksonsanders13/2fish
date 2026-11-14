import type { Metadata } from "next";
import { DashboardA } from "@/components/app/dashboard-a";
import { DashboardB } from "@/components/app/dashboard-b";
import { getDir } from "@/lib/dir";

export const metadata: Metadata = { title: "Dashboard" };

type Props = { params: Promise<{ dir: string }> };

export default async function DashboardPage({ params }: Props) {
  const dir = await getDir(params);
  return dir === "a" ? <DashboardA dir={dir} /> : <DashboardB dir={dir} />;
}
