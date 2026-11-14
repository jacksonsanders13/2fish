import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Money } from "@/components/ui/money";
import { StatusBadge } from "@/components/ui/status-badge";
import { business, plan, recovered, stats, type PlanStep } from "@/lib/data";
import type { Dir } from "@/lib/format";
import { ActivityFeed } from "./activity-feed";
import { AppShell, PageBody } from "./shell";

export function DashboardB({ dir }: { dir: Dir }) {
  return (
    <AppShell dir={dir} active="dashboard">
      <section className="on-navy bg-navy text-white">
        <Container className="py-8 sm:py-10">
          <p className="text-sm text-on-navy-muted">{business.name} · November</p>
          <h1 className="mt-1 font-bold">Good afternoon, {business.ownerFirst}.</h1>
          <div className="mt-6 grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <p className="text-sm font-semibold">Recovered this month</p>
              <p className="mt-1 text-display font-bold">
                <Money amount={recovered.amount} tone="cash-bright" />
              </p>
              <p className="mt-3 max-w-sm text-sm text-on-navy-muted">
                {recovered.jobs} jobs traced back to your plan, {recovered.period}. On pace for about{" "}
                <Money amount={recovered.pace} tone="white" className="font-semibold" />.
              </p>
            </div>
            <dl className="grid grid-cols-3 gap-px overflow-hidden rounded-lg border border-on-navy-line bg-on-navy-line md:w-[440px]">
              {stats.map((s) => (
                <div key={s.label} className="bg-navy p-3 sm:p-4">
                  <dt className="text-sm text-on-navy-muted">{s.label}</dt>
                  <dd className="num mt-1 font-bold">{s.value}</dd>
                  <dd className="text-sm text-on-navy-muted">{s.sub}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Container>
      </section>

      <PageBody className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <section aria-labelledby="plan" className="min-w-0">
          <div className="flex items-baseline justify-between">
            <h2 id="plan" className="font-bold">
              Your plan
            </h2>
            <p className="text-sm text-muted-foreground">Biggest leak first</p>
          </div>
          <ol className="mt-4 space-y-3">
            {plan.map((step) => (
              <PlanCard key={step.rank} dir={dir} step={step} />
            ))}
          </ol>
        </section>
        <aside>
          <div className="flex items-baseline justify-between">
            <h2 className="font-bold">Activity</h2>
            <Button asChild variant="ghost" size="sm">
              <Link href={`/${dir}/results`}>See your audit</Link>
            </Button>
          </div>
          <div className="mt-4 rounded-lg border border-line bg-white p-4">
            <ActivityFeed />
          </div>
        </aside>
      </PageBody>
    </AppShell>
  );
}

function PlanCard({ dir, step }: { dir: Dir; step: PlanStep }) {
  const needsYou = step.status === "needs-you" || step.status === "not-started";
  return (
    <li className="rounded-lg border border-line bg-white p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <span className="num inline-flex size-7 items-center justify-center rounded-full bg-navy text-sm font-bold text-white">
          {step.rank}
        </span>
        <StatusBadge status={step.status} />
      </div>
      <h3 className="mt-3 font-bold">{step.title}</h3>
      <p className="mt-1 text-sm">{step.detail}</p>
      <div className="mt-4 flex items-center justify-between gap-3 border-t border-line pt-4">
        <div>
          <p className="text-sm text-muted-foreground">Worth about</p>
          <Money amount={step.impact} per="/mo" sign="+" className="font-bold" />
        </div>
        <Button asChild size="sm" variant={needsYou ? "default" : "outline"}>
          <Link href={`/${dir}/${step.action.href}`}>{needsYou ? "Do it for me" : step.action.label}</Link>
        </Button>
      </div>
    </li>
  );
}
