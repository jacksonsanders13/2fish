"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { ArrowRight, MailCheck } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Input } from "@/components/ui/input";
import { requestMagicLink } from "@/lib/plan/actions";

export function LoginScreen({ next, error }: { next: string; error?: string }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [message, setMessage] = useState<string | null>(
    error === "expired" ? "That link expired. Ask for a new one." : error === "missing" ? "That link didn't work. Try again." : null,
  );
  const [pending, start] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    start(async () => {
      const res = await requestMagicLink({ email, next });
      if (res.ok) setSent(true);
      else setMessage(res.message);
    });
  }

  return (
    <div className="flex min-h-dvh flex-col bg-white">
      <header className="on-navy border-b border-on-navy-line bg-navy text-white">
        <Container className="flex h-16 items-center justify-between gap-4">
          <Link href="/" className="rounded-md">
            <Logo />
          </Link>
          <span className="text-sm font-semibold">Sign in</span>
          <Link href="/audit" className="text-sm text-white/85 underline underline-offset-2">
            Start the free audit
          </Link>
        </Container>
      </header>

      <main className="flex-1">
        <Container className="max-w-md py-12 sm:py-20">
          {sent ? (
            <Reveal immediate>
              <MailCheck size={28} aria-hidden="true" className="text-navy" />
              <h1 className="mt-4 text-display font-bold">Check your email.</h1>
              <p className="mt-4">
                We sent a sign-in link to <span className="font-semibold">{email}</span>. Open it on this phone or
                computer and you&apos;ll land on your dashboard.
              </p>
              <p className="mt-3 text-sm text-muted-foreground">Nothing there after a minute? Check spam, or try again.</p>
              <Button variant="outline" className="mt-6" onClick={() => setSent(false)}>
                Use a different email
              </Button>
            </Reveal>
          ) : (
            <Reveal immediate>
              <h1 className="text-display font-bold">Sign in to 2fish.</h1>
              <p className="mt-4">No password. We email you a link that signs you in.</p>
              <form onSubmit={submit} className="mt-8 space-y-3">
                <label htmlFor="email" className="block text-sm font-semibold">
                  Your email
                </label>
                <Input
                  id="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  required
                  autoFocus
                  placeholder="you@yourbusiness.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12"
                />
                {message ? (
                  <p role="alert" className="text-sm font-semibold text-destructive">
                    {message}
                  </p>
                ) : null}
                <Button type="submit" size="lg" className="h-12 w-full" disabled={pending}>
                  {pending ? "Sending…" : "Email me a sign-in link"}
                  <ArrowRight aria-hidden="true" />
                </Button>
              </form>
              <p className="mt-6 text-sm text-muted-foreground">
                New here? <Link href="/audit" className="underline underline-offset-2">Take the 5-minute audit</Link> first.
                You&apos;ll be asked for your email at the end.
              </p>
            </Reveal>
          )}
        </Container>
      </main>
    </div>
  );
}
