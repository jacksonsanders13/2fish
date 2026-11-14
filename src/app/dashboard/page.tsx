import type { Metadata } from "next";
import Link from "next/link";
import { HandHeartIcon, InboxIcon, PackageIcon, PlusIcon } from "lucide-react";
import { AppShell, PageHeader } from "@/components/layout/app-shell";
import { NeedCard } from "@/components/needs/need-card";
import { Button } from "@/components/ui/button";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { requireProfile } from "@/lib/auth/server";
import { fetchMyNeeds, rowToCard } from "@/lib/needs/queries";
import { fetchThreads } from "@/lib/messages/queries";
import { publicUrl } from "@/lib/storage";
import { initials, timeAgo, truncate } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const profile = await requireProfile("/dashboard");
  const sp = await searchParams;
  const [{ mine, helping }, threads] = await Promise.all([fetchMyNeeds(profile.id), fetchThreads(profile.id)]);

  const me = { displayName: profile.display_name, avatarUrl: publicUrl("avatars", profile.avatar_url), area: profile.area };
  const active = mine.filter((n) => n.status === "open" || n.status === "pledged");
  const past = mine.filter((n) => n.status === "fulfilled" || n.status === "closed");
  const helpingActive = helping.filter((n) => n.status === "pledged");
  const helpingPast = helping.filter((n) => n.status !== "pledged");
  const unread = threads.filter((t) => t.unread).length;
  const defaultTab = sp.tab === "helping" || sp.tab === "inbox" ? sp.tab : "mine";

  return (
    <AppShell>
      <PageHeader
        title={`Hi, ${profile.display_name.split(" ")[0]}`}
        description={sp.reset ? "Your password is updated." : "Your needs, the ones you're helping with, and your conversations."}
        actions={
          <Button render={<Link href="/needs/new" />}>
            <PlusIcon data-icon="inline-start" /> Post a need
          </Button>
        }
      />

      <div className="mb-6 grid grid-cols-3 gap-3">
        <Stat label="Open needs" value={active.length} />
        <Stat label="Helping with" value={helpingActive.length} />
        <Stat label="Unread" value={unread} accent={unread > 0} />
      </div>

      <Tabs defaultValue={defaultTab}>
        <TabsList className="mb-5">
          <TabsTrigger value="mine">My needs</TabsTrigger>
          <TabsTrigger value="helping">Helping with</TabsTrigger>
          <TabsTrigger value="inbox">
            Inbox {unread > 0 && <span className="ml-1 rounded-full bg-brand px-1.5 text-[10px] text-brand-foreground">{unread}</span>}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="mine" className="space-y-8">
          {active.length === 0 && past.length === 0 ? (
            <Empty className="border bg-card py-14">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <PackageIcon />
                </EmptyMedia>
                <EmptyTitle>You haven't posted a need</EmptyTitle>
                <EmptyDescription>When you do, it shows up here with its status, and neighbors nearby see it on the board.</EmptyDescription>
              </EmptyHeader>
              <Button render={<Link href="/needs/new" />}>Post a need</Button>
            </Empty>
          ) : (
            <>
              <Section title="Active" count={active.length}>
                {active.map((n) => (
                  <NeedCard key={n.id} need={rowToCard(n, me)} href={`/needs/${n.id}`} />
                ))}
              </Section>
              {past.length > 0 && (
                <Section title="Fulfilled and closed" count={past.length} muted>
                  {past.map((n) => (
                    <NeedCard key={n.id} need={rowToCard(n, me)} href={`/needs/${n.id}`} className="opacity-80" />
                  ))}
                </Section>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="helping" className="space-y-8">
          {helping.length === 0 ? (
            <Empty className="border bg-card py-14">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <HandHeartIcon />
                </EmptyMedia>
                <EmptyTitle>Nothing yet</EmptyTitle>
                <EmptyDescription>Browse needs near you and tap “I can help” on one you can cover. It'll show up here.</EmptyDescription>
              </EmptyHeader>
              <Button variant="outline" render={<Link href="/needs" />}>
                Browse needs
              </Button>
            </Empty>
          ) : (
            <>
              <Section title="In progress" count={helpingActive.length}>
                {helpingActive.map((n) => (
                  <NeedCard key={n.id} need={rowToCard(n, { displayName: n.poster?.display_name ?? "A neighbor", avatarUrl: publicUrl("avatars", n.poster?.avatar_url), area: n.poster?.area })} href={`/needs/${n.id}`} />
                ))}
              </Section>
              {helpingPast.length > 0 && (
                <Section title="Done" count={helpingPast.length} muted>
                  {helpingPast.map((n) => (
                    <NeedCard key={n.id} need={rowToCard(n, { displayName: n.poster?.display_name ?? "A neighbor", avatarUrl: publicUrl("avatars", n.poster?.avatar_url), area: n.poster?.area })} href={`/needs/${n.id}`} className="opacity-80" />
                  ))}
                </Section>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="inbox">
          {threads.length === 0 ? (
            <Empty className="border bg-card py-14">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <InboxIcon />
                </EmptyMedia>
                <EmptyTitle>No conversations yet</EmptyTitle>
                <EmptyDescription>A conversation starts the moment someone offers to help, or you offer on someone else's need.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <ul className="divide-y rounded-2xl border bg-card">
              {threads.slice(0, 8).map((t) => (
                <li key={t.id}>
                  <Link href={`/messages/${t.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50">
                    <Avatar>
                      {t.other.avatarUrl && <AvatarImage src={t.other.avatarUrl} alt="" />}
                      <AvatarFallback className="text-xs">{initials(t.other.displayName)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className={cn("truncate text-sm", t.unread ? "font-semibold" : "font-medium")}>{t.other.displayName}</p>
                        <span className="shrink-0 text-xs text-muted-foreground">{timeAgo(t.lastMessageAt)}</span>
                      </div>
                      <p className="truncate text-xs text-muted-foreground">
                        {t.needTitle} · {t.lastMessage ? (t.lastMessage.mine ? "You: " : "") + truncate(t.lastMessage.body, 60) : "No messages yet"}
                      </p>
                    </div>
                    {t.unread && <span className="size-2 shrink-0 rounded-full bg-brand" />}
                  </Link>
                </li>
              ))}
              {threads.length > 8 && (
                <li className="px-4 py-3 text-center">
                  <Link href="/messages" className="text-sm font-medium underline underline-offset-4">
                    All conversations
                  </Link>
                </li>
              )}
            </ul>
          )}
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}

function Stat({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className="rounded-xl border bg-card px-4 py-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn("mt-1 text-2xl font-semibold tabular-nums", accent && "text-brand-text")}>{value}</p>
    </div>
  );
}

function Section({ title, count, muted, children }: { title: string; count: number; muted?: boolean; children: React.ReactNode }) {
  return (
    <section>
      <h2 className={cn("mb-3 text-sm font-semibold", muted && "text-muted-foreground")}>
        {title} <span className="font-normal text-muted-foreground">({count})</span>
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}
