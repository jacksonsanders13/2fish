import type { Metadata } from "next";
import { SettingsView } from "@/components/app/settings";
import { AppShell, PageBody } from "@/components/app/shell";
import { getSettings } from "@/lib/app/queries";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const { email, business } = await getSettings();
  return (
    <AppShell active="settings" email={email}>
      <PageBody>
        <SettingsView email={email} business={business} />
      </PageBody>
    </AppShell>
  );
}
