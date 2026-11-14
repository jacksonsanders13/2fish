import Link from "next/link";
import { AnimatedMoney } from "@/components/motion/animated-money";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { Money } from "@/components/ui/money";
import { StatusBadge } from "@/components/ui/status-badge";
import { business, plan, recovered, stats, type PlanStep } from "@/lib/data";
import type { Dir } from "@/lib/format";
import { ActivityFeed } from "./activity-feed";
import { AppShell, PageBody } from "./shell";

export function DashboardA({ dir }: { dir: Dir }) {
  return (
    <AppShell dir={dir} active="dashboard">
      <PageBody>
        <Reveal immediate className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">{business.name} · November 2026</p>
            <h1 className="mt-1 font-semibold">Good afternoon, {business.ownerFirst}.</h1>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href={`/${dir}/results`}>See your audit</Link>
          </Button>
        </Reveal>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="min-w-0">
            <Reveal immediate delay={0.06}>
              <section aria-labelledby="recovered" className="rounded-lg border border-line bg-white p-5 sm:p-6">
                <h2 id="recovered" className="text-sm font-semibold">
                  Recovered this month
                </h2>
                <p className="mt-2 text-display font-semibold">
                  <AnimatedMoney amount={recovered.amount} duration={1.2} />
                </p>
                <p className="mt-3 text-sm">
                  {recovered.jobs} jobs traced back to your plan, {recovered.period}. On pace for about{" "}
                  <Money amount={recovered.pace} tone="ink" className="font-semibold" />.
                </p>
                <dl className="mt-6 grid grid-cols-3 gap-4 border-t border-line pt-5">
                  {stats.map((s) => (
                    <div key={s.label}>
                      <dt className="text-sm text-muted-foreground">{s.label}</dt>
                      <dd className="num mt-1 font-semibold">{s.value}</dd>
                      <dd className="text-sm">{s.sub}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            </Reveal>

            <section className="mt-6" aria-labelledby="plan">
              <Reveal className="flex items-baseline justify-between">
                <h2 id="plan" className="font-semibold">
                  Your plan
                </h2>
                <p className="text-sm text-muted-foreground">Biggest leak first</p>
              </Reveal>
              <ol className="mt-3 divide-y divide-line rounded-lg border border-line bg-white">
                {plan.map((step, i) => (
                  <PlanRow key={step.rank} dir={dir} step={step} delay={i * 0.06} />
                ))}
              </ol>
            </section>
          </div>

          <Reveal as="div" delay={0.12}>
            <aside>
              <h2 className="font-semibold">Activity</h2>
              <div className="mt-3 rounded-lg border border-line bg-white p-4">
                <ActivityFeed />
              </div>
            </aside>
          </Reveal>
        </div>
      </PageBody>
    </AppShell>
  );
}

function PlanRow({ dir, step, delay }: { dir: Dir; step: PlanStep; delay: number }) {
  const needsYou = step.status === "needs-you" || step.status === "not-started";
  return (
    <Reveal
      as="li"
      delay={delay}
      y={8}
      className="grid gap-3 p-4 transition-colors hover:bg-surface/60 sm:grid-cols-[2rem_1fr_auto] sm:items-center sm:gap-4 sm:p-5"
    >
      <span className="num text-sm font-semibold text-muted-foreground">{step.rank}</span>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-semibold">{step.title}</h3>
          <StatusBadge status={step.status} />
        </div>
        <p className="mt-1 text-sm">{step.detail}</p>
      </div>
      <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end sm:gap-2">
        <Money amount={step.impact} per="/mo" sign="+" className="font-semibold" />
        <Button asChild size="sm" variant={needsYou ? "default" : "outline"}>
          <Link href={`/${dir}/${step.action.href}`}>{needsYou ? "Do it for me" : step.action.label}</Link>
        </Button>
      </div>
    </Reveal>
  );
}
