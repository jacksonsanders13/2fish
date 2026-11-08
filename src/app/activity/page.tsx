import type { Metadata } from "next";
import ActivityView from "@/components/ActivityView";

export const metadata: Metadata = { title: "My activity · 2fish" };

export default function ActivityPage() {
  return <ActivityView />;
}
