import { Button } from "@/components/ui/button";
import { Money } from "@/components/ui/money";
import { StatusPill } from "@/components/ui/pill";
import { business, plan, recovered, stats, type PlanStep } from "@/lib/data";
import type { Dir } from "@/lib/utils";
import { ActivityFeed } from "./activity-feed";
import { AppShell, PageBody } from "./shell";

export function DashboardA({ dir }: { dir: Dir }) {
  return (
    <AppShell dir={dir} active="dashboard">
      <PageBody>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm text-muted">{business.name} · November 2026</p>
            <h1 className="mt-1 font-display text-3xl tracking-tight sm:text-4xl">Good afternoon, {business.ownerFirst}.</h1>
          </div>
          <Button href={`/${dir}/results`} variant="secondary" size="sm">
            See your audit
          </Button>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="min-w-0">
            <section aria-labelledby="recovered" className="rounded-card border border-line bg-white p-5 sm:p-6">
              <h2 id="recovered" className="text-sm text-muted">
                Recovered this month
              </h2>
              <p className="mt-2 font-display text-6xl leading-none tracking-tight sm:text-7xl">
                <Money amount={recovered.amount} />
              </p>
              <p className="mt-3 text-sm text-muted">
                {recovered.jobs} jobs traced back to your plan, {recovered.period}. On pace for about{" "}
                <Money amount={recovered.pace} tone="ink" className="font-medium" />.
              </p>
              <dl className="mt-6 grid grid-cols-3 gap-4 border-t border-line pt-5">
                {stats.map((s) => (
                  <div key={s.label}>
                    <dt className="text-xs text-muted">{s.label}</dt>
                    <dd className="num mt-1 font-display text-2xl sm:text-3xl">{s.value}</dd>
                    <dd className="text-xs text-muted">{s.sub}</dd>
                  </div>
                ))}
              </dl>
            </section>

            <section className="mt-6" aria-labelledby="plan">
              <div className="flex items-baseline justify-between">
                <h2 id="plan" className="font-display text-2xl tracking-tight">
                  Your plan
                </h2>
                <p className="text-sm text-muted">Biggest leak first</p>
              </div>
              <ol className="mt-3 divide-y divide-line rounded-card border border-line bg-white">
                {plan.map((step) => (
                  <PlanRow key={step.rank} dir={dir} step={step} />
                ))}
              </ol>
            </section>
          </div>

          <aside>
            <h2 className="font-display text-2xl tracking-tight">Activity</h2>
            <div className="mt-3 rounded-card border border-line bg-white p-4">
              <ActivityFeed />
            </div>
          </aside>
        </div>
      </PageBody>
    </AppShell>
  );
}

function PlanRow({ dir, step }: { dir: Dir; step: PlanStep }) {
  const needsYou = step.status === "needs-you" || step.status === "not-started";
  return (
    <li className="grid gap-3 p-4 sm:grid-cols-[2.5rem_1fr_auto] sm:items-center sm:gap-4 sm:p-5">
      <span className="num font-display text-2xl text-muted">{step.rank}</span>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-medium">{step.title}</h3>
          <StatusPill status={step.status} />
        </div>
        <p className="mt-1 text-sm text-muted">{step.detail}</p>
      </div>
      <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end sm:gap-2">
        <Money amount={step.impact} per="/mo" sign="+" className="font-semibold" />
        <Button href={`/${dir}/${step.action.href}`} size="sm" variant={needsYou ? "primary" : "secondary"}>
          {needsYou ? "Do it for me" : step.action.label}
        </Button>
      </div>
    </li>
  );
}
