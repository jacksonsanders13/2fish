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
import { Money } from "@/components/ui/money";
import { sampleAnswers } from "@/lib/data";
import { savePlan } from "@/lib/plan/actions";
import { estimate, type Answers } from "@/lib/plan/estimate";
import { clearAnswers, readAnswers } from "@/lib/plan/storage";
import { createClient } from "@/lib/supabase/client";

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
  if (!answers || !est)
    return (
      <div className="min-h-dvh bg-white" aria-busy="true">
        <Container className="py-16 text-muted-foreground">Working out your numbers…</Container>
      </div>
    );

  const biggest = est.leaks[0].perMonth;
  const saved = () => {
    clearAnswers();
    router.push("/dashboard");
  };

  return (
    <div className="min-h-dvh bg-white">
      <header className="on-night border-b border-on-night-line bg-night text-white">
        <Container className="flex h-16 items-center justify-between gap-4">
          <Link href="/" className="rounded-md">
            <Logo />
          </Link>
          <span className="text-sm font-semibold">Your results</span>
          <Link href="/audit" className="text-sm text-white underline underline-offset-2">
            Change answers
          </Link>
        </Container>
      </header>

      <main>
        <section className="border-b border-line bg-surface">
          <Container className="py-12 sm:py-16">
            <div className="max-w-3xl">
              <Reveal immediate y={16}>
                <h1 className="text-display font-semibold">
                  {est.facts.store} scored <span className="num">{est.score}</span> out of 100
                </h1>
              </Reveal>
              <Reveal immediate delay={0.2}>
                <p className="mt-5 max-w-xl">
                  {est.leaks.length === 1 ? "The fix below" : `The ${est.leaks.length} fixes below`} could bring in
                  about <RollingMoney amount={est.totalMonthly} tone="ink" /> a month, or{" "}
                  <Money amount={est.totalMonthly * 12} tone="ink" className="font-semibold" /> a year. These are
                  estimates from your answers, not promises.
                </p>
                {sample ? (
                  <p className="mt-3 max-w-xl text-sm text-muted-foreground">
                    You haven&apos;t graded your store yet, so this is a sample score for Linden Row, a made-up
                    Raleigh boutique.
                  </p>
                ) : null}
              </Reveal>
              <Reveal immediate delay={0.35} className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <SavePlan answers={answers} signedIn={signedIn} onSaved={saved} />
                <Button asChild size="lg" variant="outline" className="h-12 bg-white px-5 text-base">
                  <Link href="/audit">{sample ? "Grade my store" : "Change my answers"}</Link>
                </Button>
              </Reveal>
            </div>
          </Container>
        </section>

        <section>
          <Container className="grid gap-12 py-12 sm:py-16 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
            <div>
              <Reveal>
                <h2 className="font-semibold">Your fixes, biggest first</h2>
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
                  <summary className="cursor-pointer font-semibold">How we worked this out</summary>
                  <p className="mt-3 font-semibold">Your score</p>
                  <ul className="mt-2 space-y-1">
                    {est.scoreParts.map((p) => (
                      <li key={p.label} className="flex justify-between gap-4">
                        <span>{p.label}</span>
                        <span className="num">
                          {p.points} of {p.max}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-4 font-semibold">The dollar figures</p>
                  <ul className="mt-2 space-y-2">
                    {est.leaks.map((leak) => (
                      <li key={leak.id}>
                        <span className="font-semibold">{leak.title}:</span> {leak.math}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 text-muted-foreground">
                    Based on your answers and one working guess: one extra sale for every two posts. Your
                    proof report replaces that guess with your store&apos;s real number.
                  </p>
                </details>
              </Reveal>
            </div>

            <aside>
              <Reveal delay={0.15} y={40} className="lg:sticky lg:top-6">
                <div className="rounded-lg bg-surface p-5 sm:p-6">
                    <h2 className="font-semibold">What 2fish would do</h2>
                    <p className="mt-1 text-sm">Ranked by dollars. 2fish does each step after you approve it.</p>
                    <ol className="mt-4">
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
                </div>
              </Reveal>
            </aside>
          </Container>
        </section>
      </main>
    </div>
  );
}

// "Save this plan". Signed in: saves straight away. Signed out: go to the
// sign-up page, which creates the account and saves the plan in one go.
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
  const [pending, start] = useTransition();
  const size = full ? "h-12 w-full text-base" : "h-12 px-5 text-base";

  if (signedIn) {
    return (
      <Button
        size="lg"
        variant="signal"
        className={size}
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

  return (
    <Button asChild size="lg" variant="signal" className={size}>
      <Link href="/signup">
        Save this plan
        <ArrowRight aria-hidden="true" />
      </Link>
    </Button>
  );
}
