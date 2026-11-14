import type { Metadata } from "next";
import { SettingsSection } from "@/components/settings/section";
import { UnblockButton } from "@/components/settings/unblock-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { requireProfile } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server";
import { publicUrl } from "@/lib/storage";
import { initials, timeAgo } from "@/lib/format";

export const metadata: Metadata = { title: "Blocked people" };

export default async function BlockedPage() {
  const profile = await requireProfile("/settings/blocked");
  const supabase = await createClient();
  const { data: blocks } = await supabase.from("blocks").select("*").eq("blocker_id", profile.id).order("created_at", { ascending: false });
  const ids = (blocks ?? []).map((b) => b.blocked_id);
  const { data: people } = ids.length ? await supabase.from("public_profiles").select("*").in("id", ids) : { data: [] };
  const byId = new Map((people ?? []).map((p) => [p.id, p]));

  return (
    <SettingsSection title="Blocked people" description="They can't see your posts or message you, and you won't see theirs.">
      {!blocks?.length ? (
        <p className="text-sm text-muted-foreground">You haven't blocked anyone.</p>
      ) : (
        <ul className="divide-y">
          {blocks.map((b) => {
            const p = byId.get(b.blocked_id);
            return (
              <li key={b.blocked_id} className="flex items-center gap-3 py-3">
                <Avatar>
                  {p?.avatar_url && <AvatarImage src={publicUrl("avatars", p.avatar_url) ?? ""} alt="" />}
                  <AvatarFallback className="text-xs">{initials(p?.display_name ?? "?")}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{p?.display_name ?? "Former neighbor"}</p>
                  <p className="text-xs text-muted-foreground">Blocked {timeAgo(b.created_at)}</p>
                </div>
                <UnblockButton userId={b.blocked_id} />
              </li>
            );
          })}
        </ul>
      )}
    </SettingsSection>
  );
}
