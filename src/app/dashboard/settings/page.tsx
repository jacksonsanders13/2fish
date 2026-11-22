import type { Metadata } from "next";
import { SettingsView } from "@/components/app/settings";
import { AppShell, PageBody } from "@/components/app/shell";
import { getSettings } from "@/lib/app/queries";
import { squareReady } from "@/lib/integrations/square";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ square?: string }> }) {
  const { email, business } = await getSettings();
  const { square } = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase.from("businesses").select("square_connected_at, square_synced_at, pack_day").eq("id", business.id).single();
  return (
    <AppShell active="settings" email={email}>
      <PageBody>
        <SettingsView
          email={email}
          business={business}
          packDay={(data?.pack_day as number | undefined) ?? 1}
          square={{ ready: squareReady(), connectedAt: data?.square_connected_at ?? null, syncedAt: data?.square_synced_at ?? null, status: square ?? null }}
        />
      </PageBody>
    </AppShell>
  );
}
