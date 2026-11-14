import type { Metadata } from "next";
import { SettingsSection } from "@/components/settings/section";
import { AvatarForm, NotificationsForm, ProfileForm } from "@/components/settings/profile-forms";
import { requireProfile } from "@/lib/auth/server";
import { publicUrl } from "@/lib/storage";

export const metadata: Metadata = { title: "Profile settings" };

export default async function SettingsProfilePage() {
  const profile = await requireProfile("/settings");
  return (
    <>
      <SettingsSection title="Photo">
        <AvatarForm profile={profile} avatarUrl={publicUrl("avatars", profile.avatar_url)} />
      </SettingsSection>
      <SettingsSection title="Profile" description="What neighbors see on your posts and messages.">
        <ProfileForm profile={profile} />
      </SettingsSection>
      <SettingsSection title="Notifications">
        <NotificationsForm enabled={profile.email_notifications} emailConfigured={!!process.env.RESEND_API_KEY} />
      </SettingsSection>
    </>
  );
}
