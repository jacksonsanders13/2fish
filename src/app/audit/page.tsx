import type { Metadata } from "next";
import { AuditScreen } from "@/components/screens/audit";

export const metadata: Metadata = { title: "Store Grader" };

export default function AuditPage() {
  return <AuditScreen />;
}
