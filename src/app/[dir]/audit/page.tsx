import type { Metadata } from "next";
import { AuditScreen } from "@/components/screens/audit";
import { getDir } from "@/lib/dir";

export const metadata: Metadata = { title: "Free audit" };

type Props = { params: Promise<{ dir: string }> };

export default async function AuditPage({ params }: Props) {
  const dir = await getDir(params);
  return <AuditScreen dir={dir} />;
}
