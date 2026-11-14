import type { Metadata } from "next";
import Link from "next/link";
import { InboxIcon } from "lucide-react";
import { AppShell, PageHeader } from "@/components/layout/app-shell";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Button } from "@/components/ui/button";
import { requireProfile } from "@/lib/auth/server";
import { fetchThreads } from "@/lib/messages/queries";
import { initials, timeAgo, truncate } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Messages" };

export default async function MessagesPage() {
  const profile = await requireProfile("/messages");
  const threads = await fetchThreads(profile.id);

  return (
    <AppShell size="md">
      <PageHeader title="Messages" description="One conversation per need. Keep handoff details here, never on the post." />
      {threads.length === 0 ? (
        <Empty className="border bg-card py-16">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <InboxIcon />
            </EmptyMedia>
            <EmptyTitle>No conversations yet</EmptyTitle>
            <EmptyDescription>A thread opens automatically when someone offers to help, or when you offer on a neighbor's need.</EmptyDescription>
          </EmptyHeader>
          <Button variant="outline" render={<Link href="/needs" />}>
            Browse needs
          </Button>
        </Empty>
      ) : (
        <ul className="divide-y rounded-2xl border bg-card">
          {threads.map((t) => (
            <li key={t.id}>
              <Link href={`/messages/${t.id}`} className="flex items-center gap-3 px-4 py-3.5 hover:bg-muted/50">
                <Avatar size="lg">
                  {t.other.avatarUrl && <AvatarImage src={t.other.avatarUrl} alt="" />}
                  <AvatarFallback className="text-xs">{initials(t.other.displayName)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className={cn("truncate text-sm", t.unread ? "font-semibold" : "font-medium")}>{t.other.displayName}</p>
                    <span className="shrink-0 text-xs text-muted-foreground">{timeAgo(t.lastMessageAt)}</span>
                  </div>
                  <p className="truncate text-xs text-muted-foreground">
                    <span className="text-foreground/80">{t.needTitle}</span>
                    {" · "}
                    {t.lastMessage ? (t.lastMessage.mine ? "You: " : "") + truncate(t.lastMessage.body, 80) : "No messages yet"}
                  </p>
                </div>
                {t.unread && <span className="size-2 shrink-0 rounded-full bg-brand" aria-label="Unread" />}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </AppShell>
  );
}
