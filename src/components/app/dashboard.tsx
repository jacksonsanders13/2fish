import Link from "next/link";
import { ArrowRight, LogOut } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { RollingMoney } from "@/components/motion/rolling-money";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { MinimalCard, MinimalCardContent } from "@/components/ui/minimal-card";
import { Money } from "@/components/ui/money";
import { StatusBadge } from "@/components/ui/status-badge";
import { signOut } from "@/lib/plan/actions";
import type { SavedPlan, SavedStep } from "@/lib/plan/load";
import { AppShell, PageBody } from "./shell";

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

export function Dashboard({ email, plan }: { email: string; plan: SavedPlan | null }) {
  const initials = email.slice(0, 2).toUpperCase();
  const menu = (
    <form action={signOut}>
      <button
        type="submit"
        title={`Signed in as ${email}. Click to sign out.`}
        className="flex items-center gap-2 rounded-md text-sm text-white/80 hover:text-white"
      >
        <span className="flex size-8 items-center justify-center rounded-full bg-white text-sm font-semibold text-navy">
          {initials}
        </span>
        <LogOut size={16} aria-hidden="true" />
        <span className="sr-only">Sign out</span>
      </button>
    </form>
  );

  if (!plan) {
    return (
      <AppShell active="dashboard" menu={menu}>
        <PageBody>
          <Reveal immediate className="max-w-xl">
            <p className="text-sm text-muted-foreground">{email}</p>
            <h1 className="mt-1 text-display font-bold">No plan yet.</h1>
            <p className="mt-4">
              Nine questions, about five minutes. You&apos;ll get a ranked list of where money is leaking out and
              what to fix first.
            </p>
            <Button asChild size="lg" className="mt-6 h-12 px-5 text-base">
              <Link href="/audit">
                Start the free audit
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </Reveal>
        </PageBody>
      </AppShell>
    );
  }

  const kind = plan.business.kind && plan.business.kind !== "Something else" ? plan.business.kind : "Your business";
  const date = new Date(plan.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric" });

  return (
    <AppShell active="dashboard" menu={menu}>
      <section className="on-navy bg-navy text-white">
        <Container className="py-8 sm:py-10">
          <Reveal immediate y={16}>
            <p className="text-sm text-on-navy-muted">
              {kind} · Audit from {date}
            </p>
            <h1 className="mt-1 font-bold">{greeting()}.</h1>
          </Reveal>
          <div className="mt-6 grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
            <Reveal immediate delay={0.1}>
              <p className="text-sm font-semibold">Leaking each month</p>
              <p className="mt-1 text-display font-bold">
                <RollingMoney amount={plan.totalMonthly} tone="white" />
              </p>
              <p className="mt-3 max-w-md text-sm text-on-navy-muted">{plan.summary}</p>
            </Reveal>
            <Reveal immediate delay={0.3} x={24} y={0}>
              <dl className="grid grid-cols-3 gap-px overflow-hidden rounded-lg border border-on-navy-line bg-on-navy-line md:w-[440px]">
                <div className="bg-navy p-3 sm:p-4">
                  <dt className="text-sm text-on-navy-muted">Recovered</dt>
                  <dd className="num mt-1 font-bold">
                    <Money amount={0} tone="cash-bright" />
                  </dd>
                  <dd className="text-sm text-on-navy-muted">nothing live yet</dd>
                </div>
                <div className="bg-navy p-3 sm:p-4">
                  <dt className="text-sm text-on-navy-muted">Steps</dt>
                  <dd className="num mt-1 font-bold">{plan.steps.length}</dd>
                  <dd className="text-sm text-on-navy-muted">ranked by dollars</dd>
                </div>
                <div className="bg-navy p-3 sm:p-4">
                  <dt className="text-sm text-on-navy-muted">Biggest leak</dt>
                  <dd className="num mt-1 font-bold">
                    <Money amount={plan.leaks[0]?.perMonth ?? 0} tone="white" />
                  </dd>
                  <dd className="truncate text-sm text-on-navy-muted">{plan.leaks[0]?.title}</dd>
                </div>
              </dl>
            </Reveal>
          </div>
        </Container>
      </section>

      <PageBody className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <section aria-labelledby="plan" className="min-w-0">
          <Reveal className="flex items-baseline justify-between">
            <h2 id="plan" className="font-bold">
              Your plan
            </h2>
            <p className="text-sm text-muted-foreground">Biggest leak first</p>
          </Reveal>
          <ol className="mt-4 space-y-3">
            {plan.steps.map((step, i) => (
              <PlanCard key={step.id} step={step} delay={0.1 + i * 0.1} />
            ))}
          </ol>
        </section>
        <Reveal as="div" delay={0.25} x={24} y={0}>
          <aside>
            <h2 className="font-bold">Where the money goes</h2>
            <MinimalCard className="mt-4 rounded-lg bg-white p-0 shadow-none hover:bg-white">
              <MinimalCardContent className="p-4">
                <ol className="divide-y divide-line">
                  {plan.leaks.map((leak, i) => (
                    <li key={leak.id} className="flex items-center gap-3 py-3 text-sm first:pt-0 last:pb-0">
                      <span className="num w-4 text-muted-foreground">{i + 1}</span>
                      <span className="min-w-0 flex-1 font-semibold">{leak.title}</span>
                      <Money amount={leak.perMonth} per="/mo" tone="ink" className="font-semibold" />
                    </li>
                  ))}
                </ol>
                <Button asChild variant="outline" size="sm" className="mt-4 w-full">
                  <Link href="/results">See the full results</Link>
                </Button>
              </MinimalCardContent>
            </MinimalCard>
            <p className="mt-4 text-sm text-muted-foreground">
              Signed in as {email}. Retake the audit any time from the{" "}
              <Link href="/audit" className="underline underline-offset-2">
                audit page
              </Link>
              .
            </p>
          </aside>
        </Reveal>
      </PageBody>
    </AppShell>
  );
}

function PlanCard({ step, delay }: { step: SavedStep; delay: number }) {
  const needsYou = step.status === "needs-you" || step.status === "not-started";
  return (
    <Reveal as="li" delay={delay} y={32}>
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
            <Button asChild size="sm" variant={needsYou ? "default" : "outline"}>
              <Link href={step.href}>{needsYou ? "Do it for me" : "Open"}</Link>
            </Button>
          </div>
        </MinimalCardContent>
      </MinimalCard>
    </Reveal>
  );
}
