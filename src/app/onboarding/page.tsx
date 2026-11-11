import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getProfile, requireUser } from "@/lib/auth/server";
import { safeNext } from "@/lib/validation/auth";
import { AuthCard } from "@/components/auth/auth-card";
import { OnboardingForm } from "@/components/onboarding/onboarding-form";
import AuthLayout from "@/app/(auth)/layout";

export const metadata: Metadata = { title: "Set up your profile" };

export default async function OnboardingPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requireUser("/onboarding");
  const profile = await getProfile();
  if (!profile) redirect("/login");
  const sp = await searchParams;
  const next = safeNext(sp.next);
  if (profile.onboarded_at && profile.terms_accepted_at && profile.zip) redirect(next);

  return (
    <AuthLayout>
      <AuthCard title="Almost there" description="Two quick things so neighbors nearby can find each other.">
        <OnboardingForm
          defaults={{ displayName: profile.display_name, area: profile.area ?? "", zip: profile.zip ?? "" }}
          needsTerms={!profile.terms_accepted_at}
          next={next}
        />
      </AuthCard>
    </AuthLayout>
  );
}
