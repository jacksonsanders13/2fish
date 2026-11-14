import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { AppShell, PageHeader } from "@/components/layout/app-shell";
import { NeedForm } from "@/components/needs/need-form";
import { requireProfile } from "@/lib/auth/server";
import { fetchNeed } from "@/lib/needs/queries";

export const metadata: Metadata = { title: "Edit need" };

export default async function EditNeedPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await requireProfile(`/needs/${id}/edit`);
  const need = await fetchNeed(id);
  if (!need) notFound();
  if (need.poster_id !== profile.id) redirect(`/needs/${id}`);
  if (need.status === "fulfilled" || need.status === "closed") redirect(`/needs/${id}`);

  return (
    <AppShell size="md">
      <PageHeader title="Edit your need" description="Changes show up on the board right away." />
      <div className="rounded-2xl border bg-card p-5 shadow-soft sm:p-8">
        <NeedForm need={need} photoUrl={need.photoUrl} />
      </div>
    </AppShell>
  );
}
