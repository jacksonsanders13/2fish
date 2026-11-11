import type { Metadata } from "next";
import Link from "next/link";
import { MailIcon } from "lucide-react";
import { AuthCard } from "@/components/auth/auth-card";
import { ResendConfirmationForm } from "@/components/auth/password-forms";

export const metadata: Metadata = { title: "Check your email" };

const COPY = {
  confirm: {
    title: "Check your email",
    body: "We sent a confirmation link to",
    after: "Click it to finish creating your account. It can take a minute to arrive.",
  },
  magic: {
    title: "Check your email",
    body: "We sent a sign-in link to",
    after: "Click it and you'll be signed in. The link only works once.",
  },
  reset: {
    title: "Check your email",
    body: "If there's an account for",
    after: "we sent a link to set a new password.",
  },
};

export default async function CheckEmailPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const kind = (sp.kind === "magic" || sp.kind === "reset" ? sp.kind : "confirm") as keyof typeof COPY;
  const email = sp.email ?? "";
  const c = COPY[kind];

  return (
    <AuthCard
      title={c.title}
      footer={
        <Link href="/login" className="font-medium text-foreground underline underline-offset-4">
          Back to sign in
        </Link>
      }
    >
      <div className="text-center">
        <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-brand-soft text-brand-text">
          <MailIcon className="size-5" />
        </span>
        <p className="mt-4 text-sm text-muted-foreground">
          {c.body} <span className="font-medium text-foreground">{email || "your email"}</span>, {c.after}
        </p>
        <p className="mt-3 text-xs text-muted-foreground">Nothing there? Check spam, or give it another minute.</p>
        {kind === "confirm" && email && (
          <div className="mt-5">
            <ResendConfirmationForm email={email} />
          </div>
        )}
      </div>
    </AuthCard>
  );
}
