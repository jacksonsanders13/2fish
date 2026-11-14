import type { Metadata } from "next";
import { SettingsSection } from "@/components/settings/section";
import { ChangeEmailForm, ChangePasswordForm, GoogleLinkForm } from "@/components/settings/account-forms";
import { requireProfile } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Account settings" };

export default async function AccountSettingsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requireProfile("/settings/account");
  const sp = await searchParams;
  const supabase = await createClient();
  const [{ data: userRes }, { data: identitiesRes }] = await Promise.all([supabase.auth.getUser(), supabase.auth.getUserIdentities()]);
  const user = userRes.user;
  const identities = identitiesRes?.identities ?? [];
  const hasPassword = identities.some((i) => i.provider === "email");
  const hasGoogle = identities.some((i) => i.provider === "google");

  return (
    <>
      {sp.emailChanged && (
        <p className="rounded-lg border border-success/40 bg-success-soft px-3 py-2 text-sm">Your email is updated.</p>
      )}
      {sp.error && <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm">{sp.error}</p>}
      <SettingsSection title="Email">
        <ChangeEmailForm current={user?.email ?? null} />
      </SettingsSection>
      <SettingsSection title="Password" description={hasPassword ? undefined : "You signed up with Google. Add a password to also sign in with email."}>
        <ChangePasswordForm hasPassword={hasPassword} />
      </SettingsSection>
      <SettingsSection title="Connected sign-in" description="Sign in with Google alongside your email and password.">
        <GoogleLinkForm linked={hasGoogle} canUnlink={hasGoogle && hasPassword} />
      </SettingsSection>
    </>
  );
}
