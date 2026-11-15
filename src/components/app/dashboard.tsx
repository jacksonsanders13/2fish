import Link from "next/link";
import { ArrowRight, CircleCheck, MessageSquareText, PhoneMissed, Settings, Users } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { RollingMoney } from "@/components/motion/rolling-money";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { MinimalCard, MinimalCardContent } from "@/components/ui/minimal-card";
import { Money } from "@/components/ui/money";
import { StatusBadge } from "@/components/ui/status-badge";
import type { DashboardData } from "@/lib/app/queries";
import type { SavedStep } from "@/lib/plan/load";
import { LogJobForm } from "./forms";
import { AppShell, PageBody } from "./shell";

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

const eventIcons: Record<string, typeof Users> = {
  call: PhoneMissed,
  message: MessageSquareText,
  job: CircleCheck,
  customer: Users,
  setting: Settings,
};

export function Dashboard({ data }: { data: DashboardData }) {
  const { email, business, plan, recovered, stats, events } = data;
  const month = new Date().toLocaleDateString("en-US", { month: "long" });
  const who = business.name || (business.kind && business.kind !== "Something else" ? business.kind : "Your business");

  return (
    <AppShell active="dashboard" email={email}>
      <section className="on-navy bg-navy text-white">
        <Container className="py-8 sm:py-10">
          <Reveal immediate y={16}>
            <p className="text-sm text-on-navy-muted">
              {who} · {month}
            </p>
            <h1 className="mt-1 font-bold">{greeting()}.</h1>
          </Reveal>
          <div className="mt-6 grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
            <Reveal immediate delay={0.1}>
              <p className="text-sm font-semibold">Recovered this month</p>
              <p className="mt-1 text-display font-bold">
                <RollingMoney amount={recovered.month} tone="cash-bright" />
              </p>
              <p className="mt-3 max-w-md text-sm text-on-navy-muted">
                {recovered.monthJobs === 0
                  ? "Nothing logged yet this month. Every job you win from a step gets counted here."
                  : `${recovered.monthJobs} ${recovered.monthJobs === 1 ? "job" : "jobs"} traced back to your plan this month. ${recovered.allTime > recovered.month ? `$${recovered.allTime.toLocaleString()} all time.` : ""}`}
              </p>
            </Reveal>
            <Reveal immediate delay={0.3} x={24} y={0}>
              <dl className="grid grid-cols-3 gap-px overflow-hidden rounded-lg border border-on-navy-line bg-on-navy-line md:w-[440px]">
                <Stat label="Texts sent" value={stats.textedBack} sub="to missed callers" />
                <Stat label="Chats" value={stats.conversations} sub="in your inbox" />
                <Stat label="Customers" value={stats.customers} sub="on your list" />
              </dl>
            </Reveal>
          </div>
        </Container>
      </section>

      <PageBody className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <section aria-labelledby="plan" className="min-w-0">
          <Reveal className="flex items-baseline justify-between">
            <h2 id="plan" className="font-bold">
              Your plan
            </h2>
            <p className="text-sm text-muted-foreground">{plan ? "Biggest leak first" : ""}</p>
          </Reveal>
          {plan ? (
            <ol className="mt-4 space-y-3">
              {plan.steps.map((step, i) => (
                <PlanCard key={step.id} step={step} delay={0.1 + i * 0.1} />
              ))}
            </ol>
          ) : (
            <Reveal className="mt-4">
              <MinimalCard className="rounded-lg bg-white p-0 shadow-none hover:bg-white">
                <MinimalCardContent className="p-5">
                  <h3 className="font-bold">No plan yet.</h3>
                  <p className="mt-1 text-sm">Nine questions, about five minutes. You get a ranked list of where money leaks out and what to fix first.</p>
                  <Button asChild className="mt-4">
                    <Link href="/audit">
                      Start the free audit
                      <ArrowRight aria-hidden="true" />
                    </Link>
                  </Button>
                </MinimalCardContent>
              </MinimalCard>
            </Reveal>
          )}
        </section>

        <div className="min-w-0 space-y-8">
          <Reveal as="div" delay={0.2} x={24} y={0}>
            <h2 className="font-bold">Log a job you won</h2>
            <p className="mt-1 text-sm text-muted-foreground">This is how the number at the top goes up.</p>
            <MinimalCard className="mt-3 rounded-lg bg-white p-0 shadow-none hover:bg-white">
              <MinimalCardContent className="p-4">
                <LogJobForm compact />
              </MinimalCardContent>
            </MinimalCard>
          </Reveal>

          <Reveal as="div" delay={0.3} x={24} y={0}>
            <h2 className="font-bold">Activity</h2>
            <MinimalCard className="mt-3 rounded-lg bg-white p-0 shadow-none hover:bg-white">
              <MinimalCardContent className="p-4">
                {events.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Nothing yet. Turn on text-back, add a customer, or log a job and it shows up here.
                  </p>
                ) : (
                  <ul className="divide-y divide-line">
                    {events.map((e) => {
                      const Icon = eventIcons[e.kind] ?? CircleCheck;
                      return (
                        <li key={e.id} className="flex gap-3 py-3 first:pt-0 last:pb-0">
                          <Icon size={16} className="mt-1 shrink-0" aria-hidden="true" />
                          <div className="min-w-0">
                            <p className="text-sm">{e.text}</p>
                            <p className="num mt-0.5 text-sm text-muted-foreground">{when(e.createdAt)}</p>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </MinimalCardContent>
            </MinimalCard>
          </Reveal>
        </div>
      </PageBody>
    </AppShell>
  );
}

function Stat({ label, value, sub }: { label: string; value: number; sub: string }) {
  return (
    <div className="min-w-0 bg-navy p-3 sm:p-4">
      <dt className="text-sm text-on-navy-muted">{label}</dt>
      <dd className="num mt-1 font-bold">{value}</dd>
      <dd className="text-sm text-on-navy-muted">{sub}</dd>
    </div>
  );
}

function when(iso: string) {
  const d = new Date(iso);
  const today = new Date().toDateString() === d.toDateString();
  return today
    ? d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
    : d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function PlanCard({ step, delay }: { step: SavedStep; delay: number }) {
  const live = step.status === "live" || step.status === "done";
  return (
    <Reveal as="li" delay={delay} y={24}>
      <MinimalCard className="rounded-lg bg-white p-0 shadow-none transition-colors hover:border-navy/40 hover:bg-white">
        <MinimalCardContent className="p-4 sm:p-5">
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
            <Button asChild size="sm" variant={live ? "outline" : "default"}>
              <Link href={step.href}>{live ? "Open" : step.key === "text-back" ? "Set it up" : "Preview"}</Link>
            </Button>
          </div>
        </MinimalCardContent>
      </MinimalCard>
    </Reveal>
  );
}
