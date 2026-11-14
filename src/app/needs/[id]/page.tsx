import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ClockIcon, ExternalLinkIcon, GiftIcon, MapPinIcon, ShieldCheckIcon, ZapIcon } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { NeedActions } from "@/components/needs/need-actions";
import { StatusPill } from "@/components/needs/need-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getUser } from "@/lib/auth/server";
import { fetchNeed } from "@/lib/needs/queries";
import { CATEGORY_META, FULFILLMENT_META, URGENCY_META } from "@/lib/needs/constants";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { formatDistance, initials, safeUrl, timeAgo, truncate } from "@/lib/format";
import { publicUrl } from "@/lib/storage";
import { SITE } from "@/lib/site";

type Params = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  if (!isSupabaseConfigured()) return { title: "Need" };
  const need = await fetchNeed(id);
  if (!need) return { title: "Need not found" };
  return {
    title: need.title,
    description: truncate(need.description, 160),
    openGraph: { title: `${need.title} · ${SITE.name}`, description: truncate(need.description, 160) },
  };
}

export default async function NeedPage({ params }: Params) {
  const { id } = await params;
  if (!isSupabaseConfigured()) notFound();
  const [need, user] = await Promise.all([fetchNeed(id), getUser()]);
  if (!need) notFound();

  const viewer = !user ? "anon" : user.id === need.poster_id ? "poster" : user.id === need.helper_id ? "helper" : "other";

  // distance from the viewer, if we know where they are
  let distance: number | null = null;
  let threadId: string | null = null;
  if (user) {
    const supabase = await createClient();
    const [{ data: me }, { data: thread }] = await Promise.all([
      supabase.from("profiles").select("lat, lng").eq("id", user.id).maybeSingle(),
      viewer === "poster" || viewer === "helper"
        ? supabase.from("threads").select("id").eq("need_id", need.id).eq("helper_id", need.helper_id ?? "00000000-0000-0000-0000-000000000000").maybeSingle()
        : Promise.resolve({ data: null }),
    ]);
    if (me?.lat != null && me.lng != null) {
      const { data } = await supabase.rpc("miles_between", { lat1: me.lat, lng1: me.lng, lat2: need.lat, lng2: need.lng });
      distance = typeof data === "number" ? data : null;
    }
    threadId = thread?.id ?? null;
  }

  const cat = CATEGORY_META[need.category];
  const CatIcon = cat.icon;
  const wishlist = safeUrl(need.wishlist_url);
  const posterName = need.poster?.display_name ?? "A neighbor";

  return (
    <AppShell size="md">
      <div className="grid gap-8 md:grid-cols-[1fr_320px]">
        <article className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <Badge variant="outline" className="h-6 gap-1.5 px-2">
              <CatIcon /> {cat.label}
            </Badge>
            {need.urgency === "high" && need.status === "open" && (
              <Badge className="h-6 bg-brand-soft px-2 text-brand-text">
                <ZapIcon /> {URGENCY_META.high.label}
              </Badge>
            )}
            <StatusPill status={need.status} className="h-6" />
          </div>
          <h1 className="text-display mt-4 text-3xl font-semibold sm:text-4xl">{need.title}</h1>

          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
            <Link href={`/u/${need.poster_id}`} className="inline-flex items-center gap-2 rounded-md text-foreground hover:underline">
              <Avatar size="sm">
                {need.poster?.avatar_url && <AvatarImage src={publicUrl("avatars", need.poster.avatar_url) ?? ""} alt="" />}
                <AvatarFallback className="text-[10px]">{initials(posterName)}</AvatarFallback>
              </Avatar>
              <span className="font-medium">{posterName}</span>
            </Link>
            {(need.poster?.area || distance != null) && (
              <span className="inline-flex items-center gap-1">
                <MapPinIcon className="size-3.5" />
                {[need.poster?.area, formatDistance(distance)].filter(Boolean).join(" · ")}
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              <ClockIcon className="size-3.5" /> Posted {timeAgo(need.created_at)}
            </span>
          </div>

          {need.photoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={need.photoUrl} alt="" className="mt-6 max-h-[420px] w-full rounded-2xl border object-cover" />
          )}

          <p className="mt-6 text-[15px] leading-7 whitespace-pre-wrap">{need.description}</p>

          <section className="mt-8 rounded-2xl border bg-card p-5">
            <h2 className="text-sm font-semibold">How to get it to {viewer === "poster" ? "you" : posterName}</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {(need.fulfillment === "in_person" || need.fulfillment === "both") && (
                <div className="flex gap-3 rounded-xl border bg-background p-3.5">
                  <MapPinIcon className="mt-0.5 size-4 shrink-0 text-brand-text" />
                  <div>
                    <p className="text-sm font-medium">{FULFILLMENT_META.in_person.label}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">Agree on a public spot in messages after you offer. Never a home address.</p>
                  </div>
                </div>
              )}
              {(need.fulfillment === "wishlist" || need.fulfillment === "both") && (
                <div className="flex gap-3 rounded-xl border bg-background p-3.5">
                  <GiftIcon className="mt-0.5 size-4 shrink-0 text-brand-text" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{FULFILLMENT_META.wishlist.label}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">The store ships it straight to them.</p>
                    {wishlist && (
                      <Button variant="outline" size="sm" className="mt-2" render={<a href={wishlist} target="_blank" rel="noopener noreferrer" />}>
                        Open wishlist <ExternalLinkIcon />
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </section>
        </article>

        <aside className="md:sticky md:top-20 md:self-start">
          <div className="rounded-2xl border bg-card p-5 shadow-soft">
            <NeedActions
              needId={need.id}
              status={need.status}
              viewer={viewer}
              posterId={need.poster_id}
              threadId={threadId}
              helperName={need.helper?.display_name ?? null}
            />
          </div>
          <Link href="/safety" className="mt-3 flex items-center gap-2 rounded-xl border bg-muted/40 px-4 py-3 text-xs text-muted-foreground hover:bg-muted">
            <ShieldCheckIcon className="size-4 shrink-0 text-brand-text" />
            Meet in public, keep addresses private, trust your gut. Read the safety tips.
          </Link>
        </aside>
      </div>
    </AppShell>
  );
}
