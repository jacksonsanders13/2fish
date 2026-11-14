import type { Metadata } from "next";
import Link from "next/link";
import { BellOffIcon, CheckCheckIcon } from "lucide-react";
import { AppShell, PageHeader } from "@/components/layout/app-shell";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Button } from "@/components/ui/button";
import { requireProfile } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server";
import { markNotificationsRead } from "@/lib/actions/messages";
import { timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Notifications" };

export default async function NotificationsPage() {
  const profile = await requireProfile("/notifications");
  const supabase = await createClient();
  const { data: items } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(100);
  const list = items ?? [];
  const unread = list.filter((n) => !n.read_at).length;

  return (
    <AppShell size="md">
      <PageHeader
        title="Notifications"
        actions={
          unread > 0 ? (
            <form action={markNotificationsRead}>
              <Button variant="outline" type="submit">
                <CheckCheckIcon /> Mark all read
              </Button>
            </form>
          ) : undefined
        }
      />
      {list.length === 0 ? (
        <Empty className="border bg-card py-16">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <BellOffIcon />
            </EmptyMedia>
            <EmptyTitle>All quiet</EmptyTitle>
            <EmptyDescription>You'll hear here when a neighbor offers to help, sends a message, or marks your help as received.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <ul className="divide-y rounded-2xl border bg-card">
          {list.map((n) => (
            <li key={n.id} className={cn("flex items-start gap-3 px-4 py-3.5", !n.read_at && "bg-brand-soft/40")}>
              <span className={cn("mt-2 size-2 shrink-0 rounded-full", n.read_at ? "bg-transparent" : "bg-brand")} />
              <div className="min-w-0 flex-1">
                <p className={cn("text-sm", !n.read_at && "font-semibold")}>{n.title}</p>
                {n.body && <p className="mt-0.5 text-sm text-muted-foreground">{n.body}</p>}
                <p className="mt-1 text-xs text-muted-foreground">{timeAgo(n.created_at)}</p>
              </div>
              {n.href && (
                <form action={markNotificationsRead}>
                  <input type="hidden" name="id" value={n.id} />
                  <Button variant="outline" size="sm" render={<Link href={n.href} />} onClick={undefined}>
                    Open
                  </Button>
                </form>
              )}
            </li>
          ))}
        </ul>
      )}
    </AppShell>
  );
}
