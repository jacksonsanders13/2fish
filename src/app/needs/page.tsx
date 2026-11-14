import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ChevronLeftIcon, ChevronRightIcon, SearchXIcon } from "lucide-react";
import { AppShell, PageHeader } from "@/components/layout/app-shell";
import { NeedCard } from "@/components/needs/need-card";
import { FeedFilters } from "@/components/needs/feed-filters";
import { FeedSkeleton } from "@/components/needs/need-card-skeleton";
import { SetupNotice } from "@/components/setup-notice";
import { Button } from "@/components/ui/button";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { getProfile, getUser } from "@/lib/auth/server";
import { fetchFeed } from "@/lib/needs/queries";
import { DEFAULT_RADIUS, RADIUS_OPTIONS } from "@/lib/needs/constants";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { lookupZip } from "@/lib/zips";
import { pluralize } from "@/lib/format";

export const metadata: Metadata = {
  title: "Browse needs",
  description: "Specific needs from neighbors near you. Pick one and say “I can help”.",
};

type SP = Record<string, string | undefined>;

export default async function NeedsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  return (
    <AppShell>
      <PageHeader
        title="Needs near you"
        description="Real, specific things neighbors need this week. Pick one you can cover."
        actions={
          <Button render={<Link href="/needs/new" />}>Post a need</Button>
        }
      />
      {!isSupabaseConfigured() ? (
        <SetupNotice />
      ) : (
        <Suspense key={JSON.stringify(sp)} fallback={<FeedSkeleton />}>
          <Feed sp={sp} />
        </Suspense>
      )}
    </AppShell>
  );
}

async function Feed({ sp }: { sp: SP }) {
  const [user, profile] = await Promise.all([getUser(), getProfile()]);

  // Where to measure distance from: the profile's ZIP, or a ZIP typed into the filter.
  const zipParam = sp.zip && /^\d{5}$/.test(sp.zip) ? sp.zip : "";
  const point = profile?.lat != null && profile.lng != null ? { lat: profile.lat, lng: profile.lng } : zipParam ? lookupZip(zipParam) : null;
  const radiusParam = sp.radius === undefined ? DEFAULT_RADIUS : Number(sp.radius);
  const radius = Number.isFinite(radiusParam) && (radiusParam === 0 || (RADIUS_OPTIONS as readonly number[]).includes(radiusParam)) ? radiusParam : DEFAULT_RADIUS;

  const page = Math.max(1, Number(sp.page) || 1);
  const feed = await fetchFeed({
    lat: point?.lat ?? null,
    lng: point?.lng ?? null,
    radius: radius === 0 ? null : radius,
    category: sp.category,
    urgency: sp.urgency,
    q: sp.q,
    page,
  });

  const state = { q: sp.q ?? "", category: sp.category ?? "", urgency: sp.urgency ?? "", radius: point ? radius : 0, zip: zipParam };

  const pageHref = (p: number) => {
    const next = new URLSearchParams();
    for (const [k, v] of Object.entries(sp)) if (v) next.set(k, v);
    next.set("page", String(p));
    return `/needs?${next.toString()}`;
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
      <div className="contents lg:block">
        <div className="lg:sticky lg:top-20">
          <FeedFilters state={state} hasLocation={!!point} signedIn={!!user} />
        </div>
      </div>
      <div className="min-w-0">
        <p className="mb-3 text-sm text-muted-foreground">
          {feed.total === 0 ? "Nothing here yet" : pluralize(feed.total, "need")}
          {point && radius ? ` within ${radius} miles` : ""}
          {sp.q ? ` matching “${sp.q}”` : ""}
        </p>
        {feed.items.length === 0 ? (
          <Empty className="border bg-card py-16">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <SearchXIcon />
              </EmptyMedia>
              <EmptyTitle>{sp.q || sp.category || sp.urgency ? "No needs match those filters" : "Quiet around here"}</EmptyTitle>
              <EmptyDescription>
                {point && radius
                  ? "Try widening the distance, or be the first to post a need in your area."
                  : "No open needs right now. Check back soon, or post one of your own."}
              </EmptyDescription>
            </EmptyHeader>
            <Button variant="outline" render={<Link href="/needs/new" />}>
              Post a need
            </Button>
          </Empty>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {feed.items.map((n) => (
              <NeedCard key={n.id} need={n} href={`/needs/${n.id}`} />
            ))}
          </div>
        )}
        {feed.pages > 1 && (
          <nav className="mt-8 flex items-center justify-between" aria-label="Pages">
            <Button variant="outline" disabled={page <= 1} render={page > 1 ? <Link href={pageHref(page - 1)} /> : undefined}>
              <ChevronLeftIcon /> Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {page} of {feed.pages}
            </span>
            <Button variant="outline" disabled={page >= feed.pages} render={page < feed.pages ? <Link href={pageHref(page + 1)} /> : undefined}>
              Next <ChevronRightIcon />
            </Button>
          </nav>
        )}
      </div>
    </div>
  );
}
