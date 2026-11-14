import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { AnimatedMoney } from "@/components/motion/animated-money";
import { AnimatedProgress } from "@/components/motion/animated-progress";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Money } from "@/components/ui/money";
import { business, leaks, plan, totalLeak } from "@/lib/data";
import type { Dir } from "@/lib/format";

export function ResultsScreen({ dir }: { dir: Dir }) {
  const biggest = leaks[0].perMonth;

  return (
    <div className="min-h-dvh bg-white">
      <header className="border-b border-line">
        <Container className="flex h-14 items-center justify-between gap-4">
          <Link href={`/${dir}`} className="rounded-md">
            <Logo />
          </Link>
          <span className="text-sm font-semibold">Your results</span>
          <Link href={`/${dir}/audit`} className="text-sm underline underline-offset-2">
            Change answers
          </Link>
        </Container>
      </header>

      <main>
        <section className="border-b border-line bg-surface">
          <Container className="py-12 sm:py-16">
            <div className="max-w-3xl">
              <Reveal immediate>
                <p className="text-sm font-semibold">Audit results · {business.name}</p>
                <h1 className="mt-3 text-display font-semibold">
                  You&apos;re losing about <AnimatedMoney amount={totalLeak} tone="ink" duration={1.4} /> a month.
                </h1>
              </Reveal>
              <Reveal immediate delay={0.1}>
                <p className="mt-5 max-w-xl">
                  That&apos;s about <Money amount={totalLeak * 12} tone="ink" className="font-semibold" /> a year.
                  Here&apos;s where it goes, biggest leak first. These are estimates from your answers, not promises.
                </p>
              </Reveal>
              <Reveal immediate delay={0.18} className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="h-12 px-5 text-base">
                  <Link href={`/${dir}/dashboard`}>
                    Put this plan on my dashboard
                    <ArrowRight aria-hidden="true" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-12 bg-white px-5 text-base">
                  <Link href={`/${dir}/audit`}>Change my answers</Link>
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
                {leaks.map((leak, i) => (
                  <Reveal as="li" key={leak.id} delay={i * 0.08}>
                    <div className="flex items-baseline justify-between gap-4">
                      <h3 className="font-semibold">
                        <span className="num mr-2 text-muted-foreground">{i + 1}</span>
                        {leak.title}
                      </h3>
                      <Money amount={leak.perMonth} per="/mo" tone="ink" className="font-semibold" />
                    </div>
                    <AnimatedProgress
                      value={(leak.perMonth / biggest) * 100}
                      delay={0.2 + i * 0.08}
                      className="mt-2 h-2"
                      aria-hidden="true"
                    />
                    <p className="mt-2 text-sm font-semibold">{leak.short}</p>
                    <p className="mt-1 text-sm">{leak.detail}</p>
                  </Reveal>
                ))}
              </ol>

              <Reveal>
                <details className="mt-8 rounded-lg border border-line p-4 text-sm">
                  <summary className="cursor-pointer font-semibold">How we estimated this</summary>
                  <ul className="mt-3 space-y-2">
                    {leaks.map((leak) => (
                      <li key={leak.id}>
                        <span className="font-semibold">{leak.title}:</span> {leak.math}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 text-muted-foreground">
                    Based on your answers plus averages for power washing companies around Raleigh. Real numbers
                    replace these once 2fish is connected to your phone line and Google listing.
                  </p>
                </details>
              </Reveal>
            </div>

            <aside>
              <Reveal delay={0.1} className="rounded-lg border border-line bg-white p-5 sm:p-6 lg:sticky lg:top-6">
                <h2 className="font-semibold">The plan to get it back</h2>
                <p className="mt-1 text-sm">Ranked by dollars. 2fish does each step. You approve.</p>
                <ol className="mt-5 divide-y divide-line">
                  {plan.slice(0, 4).map((step) => (
                    <li key={step.rank} className="flex items-center gap-3 py-3 text-sm">
                      <span className="num w-4 text-muted-foreground">{step.rank}</span>
                      <p className="min-w-0 flex-1 font-semibold">{step.title}</p>
                      <Money amount={step.impact} per="/mo" sign="+" className="font-semibold" />
                    </li>
                  ))}
                </ol>
                <Button asChild className="mt-5 w-full">
                  <Link href={`/${dir}/dashboard`}>Start with step 1</Link>
                </Button>
              </Reveal>
            </aside>
          </Container>
        </section>
      </main>
    </div>
  );
}
