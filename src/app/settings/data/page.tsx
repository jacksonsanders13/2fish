import type { Metadata } from "next";
import Link from "next/link";
import { SettingsSection } from "@/components/settings/section";
import { DeleteAccountForm, ExportButton } from "@/components/settings/account-forms";
import { requireProfile } from "@/lib/auth/server";

export const metadata: Metadata = { title: "Your data" };

export default async function DataSettingsPage() {
  await requireProfile("/settings/data");
  return (
    <>
      <SettingsSection
        title="Download your data"
        description={
          <>
            A JSON file with your profile, needs, conversations, reports and notifications. See the{" "}
            <Link href="/privacy" className="underline underline-offset-4">
              privacy policy
            </Link>{" "}
            for what we store and why.
          </>
        }
      >
        <ExportButton />
      </SettingsSection>
      <SettingsSection title="Delete your account" danger>
        <DeleteAccountForm />
      </SettingsSection>
    </>
  );
}
