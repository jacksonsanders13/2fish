import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CalendarIcon, MapPinIcon } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { NeedCard } from "@/components/needs/need-card";
import { ReportDialog } from "@/components/needs/report-dialog";
import { BlockButton } from "@/components/needs/need-actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getUser } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { rowToCard } from "@/lib/needs/queries";
import { publicUrl } from "@/lib/storage";
import { initials } from "@/lib/format";

export const metadata: Metadata = { title: "Neighbor" };

// Public profile: just the safe columns, plus their open needs.
export default async function PublicProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isSupabaseConfigured()) notFound();
  const supabase = await createClient();
  const [{ data: person }, user] = await Promise.all([supabase.from("public_profiles").select("*").eq("id", id).maybeSingle(), getUser()]);
  if (!person || person.is_banned) notFound();
  const { data: needs } = await supabase.from("needs").select("*").eq("poster_id", id).in("status", ["open", "pledged"]).order("created_at", { ascending: false });
  const { count: fulfilledCount } = await supabase.from("needs").select("id", { count: "exact", head: true }).eq("helper_id", id).eq("status", "fulfilled");

  const me = { displayName: person.display_name, avatarUrl: publicUrl("avatars", person.avatar_url), area: person.area };
  const isMe = user?.id === id;

  return (
    <AppShell size="md">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <Avatar className="size-20">
          {me.avatarUrl && <AvatarImage src={me.avatarUrl} alt="" />}
          <AvatarFallback className="text-2xl">{initials(person.display_name)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <h1 className="text-display text-3xl font-semibold">{person.display_name}</h1>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
            {person.area && (
              <span className="inline-flex items-center gap-1">
                <MapPinIcon className="size-3.5" /> {person.area}
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              <CalendarIcon className="size-3.5" /> Joined {new Date(person.created_at).toLocaleDateString(undefined, { month: "short", year: "numeric" })}
            </span>
          </div>
        </div>
        {user && !isMe && (
          <div className="flex gap-1">
            <ReportDialog targetType="profile" targetId={id} />
            <BlockButton userId={id} />
          </div>
        )}
      </div>

      {(fulfilledCount ?? 0) > 0 && (
        <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-success/40 bg-success-soft px-3 py-1 text-sm text-success">
          Helped {fulfilledCount} {fulfilledCount === 1 ? "neighbor" : "neighbors"}
        </p>
      )}

      <section className="mt-10">
        <h2 className="mb-3 text-sm font-semibold">Open needs</h2>
        {!needs?.length ? (
          <p className="rounded-xl border bg-card px-4 py-6 text-center text-sm text-muted-foreground">No open needs right now.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {needs.map((n) => (
              <NeedCard key={n.id} need={rowToCard(n, me)} href={`/needs/${n.id}`} />
            ))}
          </div>
        )}
      </section>
    </AppShell>
  );
}
