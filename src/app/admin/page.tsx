import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheckIcon } from "lucide-react";
import { AppShell, PageHeader } from "@/components/layout/app-shell";
import { ReportCard, type ReportView } from "@/components/admin/report-card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { requireAdmin } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server";
import { REPORT_REASONS } from "@/lib/validation/need";
import type { ReportRow } from "@/lib/supabase/database.types";

export const metadata: Metadata = { title: "Admin" };

export default async function AdminPage() {
  await requireAdmin();
  const supabase = await createClient();
  const [{ data: reports }, { data: stats }] = await Promise.all([
    supabase.from("reports").select("*").order("created_at", { ascending: false }).limit(200),
    supabase.rpc("site_stats"),
  ]);
  const views = await hydrate(reports ?? []);
  const open = views.filter((r) => r.status === "open");
  const done = views.filter((r) => r.status !== "open");
  const s = Array.isArray(stats) ? stats[0] : null;

  return (
    <AppShell>
      <PageHeader title="Admin" description="Reports from neighbors. Review, then remove content or suspend people when needed." />
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Open reports" value={open.length} />
        <Stat label="Open needs" value={Number(s?.open_needs ?? 0)} />
        <Stat label="Fulfilled" value={Number(s?.fulfilled_needs ?? 0)} />
        <Stat label="Neighbors" value={Number(s?.neighbors ?? 0)} />
      </div>
      <Tabs defaultValue="open">
        <TabsList className="mb-5">
          <TabsTrigger value="open">Open ({open.length})</TabsTrigger>
          <TabsTrigger value="done">Handled ({done.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="open" className="space-y-4">
          {open.length === 0 ? (
            <Empty className="border bg-card py-14">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <ShieldCheckIcon />
                </EmptyMedia>
                <EmptyTitle>Nothing to review</EmptyTitle>
                <EmptyDescription>New reports show up here the moment someone files one.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            open.map((r) => <ReportCard key={r.id} report={r} />)
          )}
        </TabsContent>
        <TabsContent value="done" className="space-y-4">
          {done.length === 0 ? <p className="text-sm text-muted-foreground">No handled reports yet.</p> : done.map((r) => <ReportCard key={r.id} report={r} />)}
        </TabsContent>
      </Tabs>
      <p className="mt-8 text-xs text-muted-foreground">
        To make someone an admin, run <code className="rounded bg-muted px-1 font-mono">update profiles set role = &apos;admin&apos; where id = &apos;…&apos;;</code> in the Supabase SQL editor. See{" "}
        <Link href="/terms" className="underline">
          Terms
        </Link>{" "}
        for the rules you're enforcing.
      </p>
    </AppShell>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border bg-card px-4 py-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}

// Pull in the thing each report points at, so the admin can see it without leaving the page.
async function hydrate(reports: ReportRow[]): Promise<ReportView[]> {
  const supabase = await createClient();
  const needIds = reports.filter((r) => r.target_type === "need").map((r) => r.target_id);
  const profileIds = reports.filter((r) => r.target_type === "profile").map((r) => r.target_id);
  const messageIds = reports.filter((r) => r.target_type === "message").map((r) => r.target_id);
  const reporterIds = reports.map((r) => r.reporter_id).filter((x): x is string => !!x);

  const [{ data: needs }, { data: messages }] = await Promise.all([
    needIds.length ? supabase.from("needs").select("id, title, description, poster_id, status").in("id", needIds) : Promise.resolve({ data: [] }),
    messageIds.length ? supabase.from("messages").select("id, body, sender_id, thread_id").in("id", messageIds) : Promise.resolve({ data: [] }),
  ]);
  const allProfileIds = Array.from(
    new Set([...profileIds, ...reporterIds, ...(needs ?? []).map((n) => n.poster_id), ...(messages ?? []).map((m) => m.sender_id).filter((x): x is string => !!x)]),
  );
  const { data: profiles } = allProfileIds.length ? await supabase.from("public_profiles").select("*").in("id", allProfileIds) : { data: [] };
  const pById = new Map((profiles ?? []).map((p) => [p.id, p]));
  const nById = new Map((needs ?? []).map((n) => [n.id, n]));
  const mById = new Map((messages ?? []).map((m) => [m.id, m]));

  return reports.map((r) => {
    const reporter = r.reporter_id ? pById.get(r.reporter_id) : undefined;
    let subjectUserId: string | null = null;
    let subject: ReportView["subject"] = { kind: "missing" };
    if (r.target_type === "need") {
      const n = nById.get(r.target_id);
      if (n) {
        subjectUserId = n.poster_id;
        subject = { kind: "need", id: n.id, title: n.title, description: n.description, status: n.status };
      }
    } else if (r.target_type === "profile") {
      const p = pById.get(r.target_id);
      if (p) {
        subjectUserId = p.id;
        subject = { kind: "profile", id: p.id, displayName: p.display_name, area: p.area };
      }
    } else {
      const m = mById.get(r.target_id);
      if (m) {
        subjectUserId = m.sender_id;
        subject = { kind: "message", id: m.id, body: m.body, threadId: m.thread_id };
      }
    }
    const subjectProfile = subjectUserId ? pById.get(subjectUserId) : undefined;
    return {
      id: r.id,
      status: r.status,
      reason: REPORT_REASONS[r.reason as keyof typeof REPORT_REASONS] ?? r.reason,
      details: r.details,
      createdAt: r.created_at,
      resolutionNote: r.resolution_note,
      reporter: reporter ? { id: reporter.id, displayName: reporter.display_name } : null,
      subjectUser: subjectProfile ? { id: subjectProfile.id, displayName: subjectProfile.display_name, isBanned: subjectProfile.is_banned } : null,
      subject,
    };
  });
}
