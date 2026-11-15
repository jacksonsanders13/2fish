import type { Metadata } from "next";
import { AuditScreen } from "@/components/screens/audit";

export const metadata: Metadata = { title: "Free audit" };

export default function AuditPage() {
  return <AuditScreen />;
}
