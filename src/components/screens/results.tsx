"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { ArrowRight } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { GrowBar } from "@/components/motion/grow-bar";
import { Reveal } from "@/components/motion/reveal";
import { RollingMoney } from "@/components/motion/rolling-money";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Input } from "@/components/ui/input";
import { MinimalCard, MinimalCardContent } from "@/components/ui/minimal-card";
import { Money } from "@/components/ui/money";
import { PopoverForm, PopoverFormButton, PopoverFormSuccess } from "@/components/ui/popover-form";
import { sampleAnswers } from "@/lib/data";
import { requestMagicLink, savePlan } from "@/lib/plan/actions";
import { estimate, type Answers } from "@/lib/plan/estimate";
import { clearAnswers, readAnswers } from "@/lib/plan/storage";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

// The results screen runs the estimate right here in the browser from the
// answers saved during the audit. Nothing is stored until the owner asks to
// save the plan, which is when we ask for an email.
export function ResultsScreen() {
  const router = useRouter();
  const [answers, setAnswers] = useState<Answers | null>(null);
  const [sample, setSample] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  // Browser storage is only readable after mount, so the setState here is on purpose.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const saved = readAnswers();
    if (saved) setAnswers(saved);
    else {
      setAnswers(sampleAnswers as Answers);
      setSample(true);
    }
    createClient()
      .auth.getUser()
      .then(({ data }) => setSignedIn(Boolean(data.user)));
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const est = useMemo(() => (answers ? estimate(answers) : null), [answers]);
  if (!answers || !est) return <div className="min-h-dvh bg-white" aria-busy="true" />;

  const biggest = est.leaks[0].perMonth;
  const saved = () => {
    clearAnswers();
    router.push("/dashboard");
  };

  return (
    <div className="min-h-dvh bg-white">
      <header className="on-navy border-b border-on-navy-line bg-navy text-white">
        <Container className="flex h-16 items-center justify-between gap-4">
          <Link href="/" className="rounded-md">
            <Logo />
          </Link>
          <span className="text-sm font-semibold">Your results</span>
          <Link href="/audit" className="text-sm text-white/85 underline underline-offset-2">
            Change answers
          </Link>
        </Container>
      </header>

      <main>
        <section className="border-b border-line bg-surface">
          <Container className="py-12 sm:py-16">
            <div className="max-w-3xl">
              <Reveal immediate y={16}>
                <p className="text-sm font-semibold">
                  {sample ? "Sample results for a Raleigh power washing company" : `Audit results · ${est.facts.kind}`}
                </p>
                <h1 className="mt-3 text-display font-semibold">
                  You&apos;re losing about <RollingMoney amount={est.totalMonthly} tone="ink" /> a month.
                </h1>
              </Reveal>
              <Reveal immediate delay={0.2}>
                <p className="mt-5 max-w-xl">
                  That&apos;s about <Money amount={est.totalMonthly * 12} tone="ink" className="font-semibold" /> a
                  year. Here&apos;s where it goes, biggest leak first. These are estimates from your answers, not
                  promises.
                </p>
              </Reveal>
              <Reveal immediate delay={0.35} className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <SavePlan answers={answers} signedIn={signedIn} onSaved={saved} />
                <Button asChild size="lg" variant="outline" className="h-12 bg-white px-5 text-base">
                  <Link href="/audit">{sample ? "Run it for my business" : "Change my answers"}</Link>
                </Button>
              </Reveal>
            </div>
          </Container>
        </section>

        <section>
          <Container className="grid gap-12 py-12 sm:py-16 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
            <div>
              <Reveal>
                <h2 className="font-semibold">Where the money goes</h2>
              </Reveal>
              <ol className="mt-6 space-y-7">
                {est.leaks.map((leak, i) => (
                  <Reveal as="li" key={leak.id} delay={i * 0.12} y={24}>
                    <div className="flex items-baseline justify-between gap-4">
                      <h3 className="font-semibold">
                        <span className="num mr-2 text-muted-foreground">{i + 1}</span>
                        {leak.title}
                      </h3>
                      <Money amount={leak.perMonth} per="/mo" tone="ink" className="font-semibold" />
                    </div>
                    <GrowBar pct={(leak.perMonth / biggest) * 100} delay={0.3 + i * 0.12} duration={1} className="mt-2" />
                    <p className="mt-2 text-sm font-semibold">{leak.short}</p>
                    <p className="mt-1 text-sm">{leak.detail}</p>
                  </Reveal>
                ))}
              </ol>

              <Reveal className="mt-8">
                <details className="rounded-lg border border-line bg-white p-4 text-sm">
                  <summary className="cursor-pointer font-semibold">How we estimated this</summary>
                  <ul className="mt-3 space-y-2">
                    {est.leaks.map((leak) => (
                      <li key={leak.id}>
                        <span className="font-semibold">{leak.title}:</span> {leak.math}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 text-muted-foreground">
                    Based on your answers plus averages for businesses like yours. Real numbers replace these once
                    2fish is connected to your phone line and Google listing.
                  </p>
                </details>
              </Reveal>
            </div>

            <aside>
              <Reveal delay={0.15} y={40} className="lg:sticky lg:top-6">
                <MinimalCard className="rounded-lg bg-white p-0 shadow-none hover:bg-white">
                  <MinimalCardContent className="p-5 sm:p-6">
                    <h2 className="font-semibold">The plan to get it back</h2>
                    <p className="mt-1 text-sm">Ranked by dollars. 2fish does each step. You approve.</p>
                    <ol className="mt-5 divide-y divide-line">
                      {est.steps.map((step, i) => (
                        <Reveal
                          as="li"
                          key={step.key}
                          delay={0.4 + i * 0.1}
                          y={10}
                          className="flex items-center gap-3 py-3 text-sm"
                        >
                          <span className="num w-4 text-muted-foreground">{step.rank}</span>
                          <p className="min-w-0 flex-1 font-semibold">{step.title}</p>
                          <Money amount={step.impact} per="/mo" sign="+" className="font-semibold" />
                        </Reveal>
                      ))}
                    </ol>
                    <div className="mt-5">
                      <SavePlan answers={answers} signedIn={signedIn} onSaved={saved} full />
                    </div>
                  </MinimalCardContent>
                </MinimalCard>
              </Reveal>
            </aside>
          </Container>
        </section>
      </main>
    </div>
  );
}

// "Save this plan". Signed in: saves straight away. Signed out: Cult UI's
// popover form asks for an email, stashes the answers in a cookie and sends a
// magic link. The callback route finishes the save.
function SavePlan({
  answers,
  signedIn,
  onSaved,
  full = false,
}: {
  answers: Answers;
  signedIn: boolean;
  onSaved: () => void;
  full?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  if (signedIn) {
    return (
      <Button
        size="lg"
        className={full ? "h-12 w-full text-base" : "h-12 px-5 text-base"}
        disabled={pending}
        onClick={() =>
          start(async () => {
            await savePlan(answers);
            onSaved();
          })
        }
      >
        {pending ? "Saving…" : "Put this plan on my dashboard"}
        <ArrowRight aria-hidden="true" />
      </Button>
    );
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    start(async () => {
      const res = await requestMagicLink({ email, answers, next: "/dashboard" });
      if (res.ok) setSent(true);
      else setError(res.message);
    });
  }

  return (
    <div
      className={cn(
        // Cult UI's PopoverForm centres itself in a 300px box and draws a small white trigger.
        // Collapse the box and dress the trigger as our primary button.
        "[&>div]:min-h-0 [&>div]:justify-start [&>div>button]:h-12 [&>div>button]:rounded-md! [&>div>button]:border-navy [&>div>button]:bg-navy [&>div>button]:px-5 [&>div>button]:text-base [&>div>button]:font-medium [&>div>button]:text-white [&>div>button:hover]:bg-navy-tint",
        full ? "w-full [&>div]:w-full [&>div>button]:w-full [&>div>button]:justify-center" : "[&>div]:w-auto",
      )}
    >
      <PopoverForm
        title="Save this plan"
        open={open}
        setOpen={setOpen}
        showSuccess={sent}
        width={full ? "100%" : "360px"}
        height="270px"
        showCloseButton
        openChild={
          <form onSubmit={submit} className="flex h-full flex-col justify-between p-4">
            <div>
              <label htmlFor="save-email" className="text-sm font-semibold">
                Where should we send your sign-in link?
              </label>
              <Input
                id="save-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                required
                autoFocus
                placeholder="you@yourbusiness.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 h-11"
              />
              <p className="mt-2 text-sm text-muted-foreground">
                No password. One tap in your email and your plan is saved.
              </p>
              {error ? (
                <p role="alert" className="mt-2 text-sm font-semibold text-destructive">
                  {error}
                </p>
              ) : null}
            </div>
            <div className="flex justify-end">
              <PopoverFormButton loading={pending} text="Email me the link" />
            </div>
          </form>
        }
        successChild={
          <PopoverFormSuccess
            title="Check your email"
            description={`We sent a link to ${email}. Open it and your plan will be waiting on your dashboard.`}
          />
        }
      />
    </div>
  );
}
