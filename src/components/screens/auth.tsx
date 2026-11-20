"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ArrowRight, Eye, EyeOff, MailCheck } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Input } from "@/components/ui/input";
import { MinimalCard, MinimalCardContent } from "@/components/ui/minimal-card";
import { TextAnimate } from "@/components/ui/text-animate";
import { signInWithPassword, signUpWithPassword, stashAnswers } from "@/lib/plan/actions";
import { readAnswers } from "@/lib/plan/storage";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type Mode = "signin" | "signup";
type Provider = "google" | "apple" | "azure";

const providers: { id: Provider; label: string; icon: React.ReactNode }[] = [
  { id: "google", label: "Google", icon: <GoogleMark /> },
  { id: "apple", label: "Apple", icon: <AppleMark /> },
  { id: "azure", label: "Microsoft", icon: <MicrosoftMark /> },
];

// One screen for both sign in and sign up. Sign up is reached from the
// results page, so creating the account also saves the plan that's waiting
// in session storage.
export function AuthScreen({ mode, next, error }: { mode: Mode; next: string; error?: string }) {
  const router = useRouter();
  const signup = mode === "signup";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<string | null>(
    error === "expired" ? "That link expired. Ask for a new one." : error === "missing" ? "That link didn't work. Try again." : null,
  );
  const [sent, setSent] = useState(false);
  const [pending, start] = useTransition();

  const title = signup ? "Save your plan." : "Welcome back.";
  const passwordOk = password.length >= 8 && /\d/.test(password);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    start(async () => {
      const answers = readAnswers() ?? undefined;
      const res = signup
        ? await signUpWithPassword({ email, password, answers, next })
        : await signInWithPassword({ email, password, answers, next });
      if (!res.ok) return setMessage(res.message);
      if ("confirm" in res && res.confirm) return setSent(true);
      router.push(res.next);
    });
  }

  function social(provider: Provider) {
    setMessage(null);
    start(async () => {
      const answers = readAnswers();
      if (answers) await stashAnswers(answers);
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
          skipBrowserRedirect: true,
        },
      });
      if (error || !data.url) {
        const name = providers.find((p) => p.id === provider)?.label ?? provider;
        setMessage(`${name} sign-in isn't set up yet. Use your email for now.`);
        return;
      }
      window.location.assign(data.url);
    });
  }

  return (
    <div className="flex min-h-dvh flex-col bg-surface">
      <header className="on-night border-b border-on-night-line bg-night text-white">
        <Container className="flex h-16 items-center justify-between gap-4">
          <Link href="/" className="rounded-md">
            <Logo />
          </Link>
          <span className="text-sm font-semibold">{signup ? "Create account" : "Sign in"}</span>
          <Link href={signup ? "/results" : "/audit"} className="text-sm text-white/85 underline underline-offset-2">
            {signup ? "Results" : "Free audit"}
          </Link>
        </Container>
      </header>

      <main className="flex-1">
        <Container className="max-w-md py-10 sm:py-16">
          <div
            role="heading"
            aria-level={1}
            aria-label={title}
            className="[&>h2]:m-0 [&>h2]:p-0 [&>h2]:text-display [&>h2]:font-display [&>h2]:font-normal [&>h2]:text-ink"
          >
            <TextAnimate text={title} type="whipIn" />
          </div>
          <Reveal immediate delay={0.3}>
            <p className="mt-4">
              {signup
                ? "Create your account and the plan you just saw goes straight to your dashboard."
                : "Sign in to see your plan and what 2fish is doing for you."}
            </p>
          </Reveal>

          <Reveal immediate delay={0.45} y={24}>
            <MinimalCard className="mt-8 rounded-lg bg-white p-0 shadow-none hover:bg-white">
              <MinimalCardContent className="p-5 sm:p-6">
                {sent ? (
                  <div>
                    <MailCheck size={28} aria-hidden="true" className="text-night" />
                    <h2 className="mt-3 font-bold">Check your email.</h2>
                    <p className="mt-2 text-sm">
                      We sent a confirmation link to {email}. Tap it and your plan will be waiting on your dashboard.
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">Nothing after a minute? Check spam, or try again.</p>
                    <Button variant="outline" className="mt-5" onClick={() => setSent(false)}>
                      Back
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="grid gap-2">
                      {providers.map((p) => (
                        <Button
                          key={p.id}
                          type="button"
                          variant="outline"
                          className="h-11 justify-start gap-3 text-base font-medium"
                          disabled={pending}
                          onClick={() => social(p.id)}
                        >
                          {p.icon}
                          Continue with {p.label}
                        </Button>
                      ))}
                    </div>

                    <div className="my-5 flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="h-px flex-1 bg-line" aria-hidden="true" />
                      or with email
                      <span className="h-px flex-1 bg-line" aria-hidden="true" />
                    </div>

                    <form onSubmit={submit} className="space-y-4">
                      <div>
                        <label htmlFor="email" className="text-sm font-semibold">
                          Email
                        </label>
                        <Input
                          id="email"
                          type="email"
                          inputMode="email"
                          autoComplete="email"
                          required
                          placeholder="you@yourbusiness.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="mt-1.5 h-11"
                        />
                      </div>
                      <div>
                        <label htmlFor="password" className="text-sm font-semibold">
                          Password
                        </label>
                        <div className="relative mt-1.5">
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            autoComplete={signup ? "new-password" : "current-password"}
                            required
                            minLength={signup ? 8 : 1}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="h-11 pr-11"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((v) => !v)}
                            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                          >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                        {signup ? (
                          <p className={cn("mt-1.5 text-sm", password && !passwordOk ? "text-destructive" : "text-muted-foreground")}>
                            At least 8 characters and one number.
                          </p>
                        ) : null}
                      </div>

                      {message ? (
                        <p role="alert" className="text-sm font-semibold text-destructive">
                          {message}
                        </p>
                      ) : null}

                      <Button type="submit" size="lg" className="h-12 w-full" disabled={pending || (signup && !passwordOk)}>
                        {pending ? "One moment…" : signup ? "Create account and save my plan" : "Sign in"}
                        <ArrowRight aria-hidden="true" />
                      </Button>
                    </form>
                  </>
                )}
              </MinimalCardContent>
            </MinimalCard>
          </Reveal>

          <Reveal immediate delay={0.6}>
            <p className="mt-6 text-sm text-muted-foreground">
              {signup ? (
                <>
                  Already have an account?{" "}
                  <Link href="/login" className="underline underline-offset-2">
                    Sign in
                  </Link>
                  .
                </>
              ) : (
                <>
                  New here?{" "}
                  <Link href="/audit" className="underline underline-offset-2">
                    Take the 5-minute audit
                  </Link>{" "}
                  and create your account at the end.
                </>
              )}
            </p>
          </Reveal>
        </Container>
      </main>
    </div>
  );
}

// Monochrome brand marks, so they sit quietly next to the label.
function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
      <path d="M21.6 12.23c0-.68-.06-1.36-.19-2.02H12v3.83h5.4a4.62 4.62 0 0 1-2 3.03v2.5h3.23c1.9-1.74 2.97-4.32 2.97-7.34Z" />
      <path d="M12 21.75c2.7 0 4.96-.9 6.62-2.42l-3.23-2.5c-.9.6-2.04.95-3.39.95-2.6 0-4.8-1.76-5.6-4.12H3.07v2.58A9.99 9.99 0 0 0 12 21.75Z" />
      <path d="M6.4 13.66a6 6 0 0 1 0-3.82V7.26H3.07a10 10 0 0 0 0 8.98l3.33-2.58Z" />
      <path d="M12 6.22c1.47 0 2.79.5 3.83 1.5l2.86-2.87A9.98 9.98 0 0 0 12 2.25a9.99 9.99 0 0 0-8.93 5.01l3.33 2.58c.8-2.36 3-4.12 5.6-4.12Z" />
    </svg>
  );
}

function AppleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
      <path d="M16.37 12.65c.02 2.43 2.13 3.24 2.15 3.25-.02.06-.34 1.15-1.11 2.28-.67.98-1.36 1.95-2.45 1.97-1.07.02-1.42-.64-2.65-.64-1.23 0-1.61.62-2.63.66-1.05.04-1.86-1.05-2.53-2.03-1.38-2-2.44-5.64-1.02-8.1a3.93 3.93 0 0 1 3.32-2.02c1.03-.02 2.01.7 2.65.7.63 0 1.82-.86 3.07-.74.52.02 1.99.21 2.93 1.59-.08.05-1.75 1.02-1.73 3.08ZM14.35 6.64c.56-.68.94-1.63.84-2.57-.81.03-1.79.54-2.37 1.22-.52.6-.98 1.57-.86 2.49.9.07 1.83-.46 2.39-1.14Z" />
    </svg>
  );
}

function MicrosoftMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
      <path d="M3 3h8.5v8.5H3zM12.5 3H21v8.5h-8.5zM3 12.5h8.5V21H3zM12.5 12.5H21V21h-8.5z" />
    </svg>
  );
}
