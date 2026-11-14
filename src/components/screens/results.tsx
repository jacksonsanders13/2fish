import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Money } from "@/components/ui/money";
import { business, leaks, plan, totalLeak } from "@/lib/data";
import type { Dir } from "@/lib/utils";

export function ResultsScreen({ dir }: { dir: Dir }) {
  const biggest = leaks[0].perMonth;

  return (
    <div className="min-h-dvh bg-white">
      <header className="border-b border-line">
        <Container className="flex h-14 items-center justify-between gap-4">
          <Link href={`/${dir}`} className="rounded-ctl">
            <Logo />
          </Link>
          <span className="text-sm text-muted">Your results</span>
          <Link href={`/${dir}/audit`} className="text-sm text-muted underline underline-offset-2 hover:text-ink">
            Change answers
          </Link>
        </Container>
      </header>

      <main>
        <section className="bg-sand">
          <Container className="py-12 sm:py-16">
            <div className="max-w-3xl">
              <p className="text-sm font-medium text-muted">Audit results · {business.name}</p>
              <h1 className="mt-3 font-display text-4xl leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
                You&apos;re losing about <Money amount={totalLeak} tone="ink" /> a month.
              </h1>
              <p className="mt-5 max-w-xl text-lg text-ink/80">
                That&apos;s about <Money amount={totalLeak * 12} tone="ink" className="font-medium" /> a year. Here&apos;s
                where it goes, biggest leak first. These are estimates from your answers, not promises.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button href={`/${dir}/dashboard`} size="lg">
                  Put this plan on my dashboard
                  <ArrowRight size={18} aria-hidden="true" />
                </Button>
                <Button href={`/${dir}/audit`} size="lg" variant="secondary">
                  Change my answers
                </Button>
              </div>
            </div>
          </Container>
        </section>

        <section>
          <Container className="grid gap-12 py-12 sm:py-16 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
            <div>
              <h2 className="font-display text-2xl tracking-tight sm:text-3xl">Where the money goes</h2>
              <ol className="mt-6 space-y-7">
                {leaks.map((leak, i) => (
                  <li key={leak.id}>
                    <div className="flex items-baseline justify-between gap-4">
                      <h3 className="font-medium">
                        <span className="num mr-2 text-muted">{i + 1}</span>
                        {leak.title}
                      </h3>
                      <Money amount={leak.perMonth} per="/mo" tone="ink" className="font-semibold" />
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-surface" aria-hidden="true">
                      <div className="h-2 rounded-full bg-navy" style={{ width: `${(leak.perMonth / biggest) * 100}%` }} />
                    </div>
                    <p className="mt-2 text-sm font-medium">{leak.short}</p>
                    <p className="mt-1 text-sm text-muted">{leak.detail}</p>
                  </li>
                ))}
              </ol>

              <details className="mt-8 rounded-card border border-line p-4 text-sm">
                <summary className="cursor-pointer font-medium">How we estimated this</summary>
                <ul className="mt-3 space-y-2 text-muted">
                  {leaks.map((leak) => (
                    <li key={leak.id}>
                      <span className="text-ink">{leak.title}:</span> {leak.math}
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-muted">
                  Based on your answers plus averages for power washing companies around Raleigh. Real numbers
                  replace these once 2fish is connected to your phone line and Google listing.
                </p>
              </details>
            </div>

            <aside>
              <div className="rounded-card border border-line bg-white p-5 sm:p-6 lg:sticky lg:top-6">
                <h2 className="font-display text-2xl tracking-tight">The plan to get it back</h2>
                <p className="mt-1 text-sm text-muted">Ranked by dollars. 2fish does each step. You approve.</p>
                <ol className="mt-5 divide-y divide-line">
                  {plan.slice(0, 4).map((step) => (
                    <li key={step.rank} className="flex items-center gap-3 py-3">
                      <span className="num w-4 text-muted">{step.rank}</span>
                      <p className="min-w-0 flex-1 text-sm font-medium">{step.title}</p>
                      <Money amount={step.impact} per="/mo" sign="+" className="text-sm font-semibold" />
                    </li>
                  ))}
                </ol>
                <Button href={`/${dir}/dashboard`} className="mt-5 w-full">
                  Start with step 1
                </Button>
                <p className="mt-3 text-xs text-muted">Free to see the plan. Pro turns the steps on.</p>
              </div>
            </aside>
          </Container>
        </section>
      </main>
    </div>
  );
}
