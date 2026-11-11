import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";
import { ResetPasswordForm } from "@/components/auth/password-forms";
import { getUser } from "@/lib/auth/server";

export const metadata: Metadata = { title: "Set a new password" };

export default async function ResetPasswordPage() {
  const user = await getUser();
  if (!user) {
    return (
      <AuthCard
        title="That link has expired"
        description="Password reset links only work for a little while. Request a fresh one."
        footer={
          <Link href="/forgot-password" className="font-medium text-foreground underline underline-offset-4">
            Send a new link
          </Link>
        }
      >
        <p className="text-sm text-muted-foreground">
          If you clicked the link in a different browser than the one you asked from, try again from the same one.
        </p>
      </AuthCard>
    );
  }
  return (
    <AuthCard title="Set a new password" description={`For ${user.email ?? "your account"}.`}>
      <ResetPasswordForm />
    </AuthCard>
  );
}
