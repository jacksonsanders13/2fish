import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon, ShieldCheckIcon } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Container } from "@/components/layout/container";
import { ThreadView } from "@/components/messages/thread-view";
import { StatusPill } from "@/components/needs/need-card";
import { ReportDialog } from "@/components/needs/report-dialog";
import { BlockButton } from "@/components/needs/need-actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { requireProfile } from "@/lib/auth/server";
import { fetchThread } from "@/lib/messages/queries";
import { initials } from "@/lib/format";

export const metadata: Metadata = { title: "Conversation" };

export default async function ThreadPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | undefined>> }) {
  const { id } = await params;
  const sp = await searchParams;
  const profile = await requireProfile(`/messages/${id}`);
  const data = await fetchThread(id, profile.id);
  if (!data) notFound();
  const { thread, need, other, messages, role } = data;

  const disabledReason = !other
    ? "The other person is no longer on 2fish."
    : need?.status === "closed"
      ? "This need was closed. You can still read the conversation."
      : undefined;

  return (
    <div className="flex min-h-dvh flex-col">
      <Header />
      <Container size="md" className="flex min-h-0 flex-1 flex-col py-4">
        <div className="flex items-center gap-3 border-b pb-3">
          <Button variant="ghost" size="icon" render={<Link href="/messages" />} aria-label="Back to messages">
            <ArrowLeftIcon />
          </Button>
          {other ? (
            <Link href={`/u/${other.id}`} className="flex min-w-0 items-center gap-2.5 rounded-md">
              <Avatar>
                {other.avatarUrl && <AvatarImage src={other.avatarUrl} alt="" />}
                <AvatarFallback className="text-xs">{initials(other.displayName)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{other.displayName}</p>
                <p className="truncate text-xs text-muted-foreground">{role === "helper" ? "Posted this need" : "Offered to help"}</p>
              </div>
            </Link>
          ) : (
            <p className="text-sm font-medium text-muted-foreground">Former neighbor</p>
          )}
          <div className="ml-auto flex items-center gap-1">
            {other?.id && <ReportDialog targetType="profile" targetId={other.id} label="Report" />}
            {other?.id && <BlockButton userId={other.id} />}
          </div>
        </div>

        {need && (
          <Link href={`/needs/${need.id}`} className="mt-3 flex items-center gap-3 rounded-xl border bg-card px-4 py-2.5 text-sm hover:bg-muted/50">
            <span className="min-w-0 flex-1 truncate">
              <span className="text-muted-foreground">About: </span>
              <span className="font-medium">{need.title}</span>
            </span>
            <StatusPill status={need.status} />
          </Link>
        )}

        {sp.offered && (
          <div className="mt-3 rounded-xl border border-brand/40 bg-brand-soft px-4 py-3 text-sm text-brand-text">
            You're in. Suggest a public meeting spot (library, grocery store, church lobby) or confirm you've ordered from the wishlist.
          </div>
        )}

        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
          <ShieldCheckIcon className="size-3.5 shrink-0 text-brand-text" />
          Meet in public. Never share a home address.{" "}
          <Link href="/safety" className="underline underline-offset-4">
            Safety tips
          </Link>
        </div>

        <ThreadView
          threadId={thread.id}
          userId={profile.id}
          initialMessages={messages}
          otherName={other?.displayName ?? "Neighbor"}
          disabled={!!disabledReason}
          disabledReason={disabledReason}
        />
      </Container>
    </div>
  );
}
