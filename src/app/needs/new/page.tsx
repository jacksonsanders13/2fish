import type { Metadata } from "next";
import { AppShell, PageHeader } from "@/components/layout/app-shell";
import { NeedForm } from "@/components/needs/need-form";
import { requireProfile } from "@/lib/auth/server";

export const metadata: Metadata = { title: "Post a need" };

export default async function NewNeedPage() {
  await requireProfile("/needs/new");
  return (
    <AppShell size="md">
      <PageHeader title="Post a need" description="One specific thing. A neighbor nearby will see it within minutes." />
      <div className="rounded-2xl border bg-card p-5 shadow-soft sm:p-8">
        <NeedForm />
      </div>
    </AppShell>
  );
}
