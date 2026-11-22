"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ChevronLeft, ChevronRight, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Money } from "@/components/ui/money";
import { setPlanPrice } from "@/lib/pilot/actions";
import { monthName, shortDate } from "@/lib/pilot/dates";
import type { ReportData } from "@/lib/pilot/queries";
import { cn } from "@/lib/utils";

function shiftMonth(ym: string, n: number) {
  const d = new Date(`${ym}-01T12:00:00Z`);
  d.setUTCMonth(d.getUTCMonth() + n);
  return d.toISOString().slice(0, 7);
}

function pct(n: number) {
  return `${n >= 0 ? "+" : ""}${Math.round(n * 100)}%`;
}

// The monthly report, all from Square: what the posted items sold, the best and
// worst posts, and weekly sales against the weeks before 2fish. Nothing to type.
export function ReportView({ data }: { data: ReportData }) {
  const { planPrice, weekly, startedWeek, month, today, square, scores } = data;

  const done = scores.filter((s) => s.items.length);
  const extra = done.reduce((s, x) => s + Math.max(0, x.extraDollars), 0);
  const ranked = [...done].filter((s) => !s.partial).sort((a, b) => b.extraDollars - a.extraDollars);
  const best = ranked.slice(0, 3).filter((s) => s.extraDollars > 0);
  const worst = ranked.length > 3 ? ranked.slice(-2).reverse() : [];

  // Baseline: the last 4 finished weeks before the first approved posts.
  const sorted = [...weekly].sort((a, b) => (a.weekOf < b.weekOf ? -1 : 1));
  const before = startedWeek ? sorted.filter((w) => w.weekOf < startedWeek) : sorted;
  const base = before.slice(-4);
  const baseline = base.length ? base.reduce((s, w) => s + w.amount, 0) / base.length : null;
  const rows = sorted.slice(-12).reverse();

  return (
    <div>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-display font-semibold">
            {data.business.name || "Your store"}: {monthName(month)}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">What your posts sold this month, from Square.</p>
        </div>
        <div className="flex items-center gap-2 print:hidden">
          <Button asChild size="icon" variant="outline">
            <Link href={`/dashboard/report?month=${shiftMonth(month, -1)}`} aria-label="Previous month">
              <ChevronLeft aria-hidden="true" />
            </Link>
          </Button>
          {month < today.slice(0, 7) ? (
            <Button asChild size="icon" variant="outline">
              <Link href={`/dashboard/report?month=${shiftMonth(month, 1)}`} aria-label="Next month">
                <ChevronRight aria-hidden="true" />
              </Link>
            </Button>
          ) : null}
          <Button variant="outline" onClick={() => window.print()}>
            <Printer aria-hidden="true" />
            Print
          </Button>
        </div>
      </header>

      {!square ? (
        <section className="mt-6 rounded-lg bg-white p-5">
          <h2 className="font-semibold">Connect Square to see this report</h2>
          <p className="mt-1 text-sm">2fish reads your sales by itself and matches them to your posts. Nothing to type in.</p>
          <Button asChild variant="signal" className="mt-4">
            <Link href="/dashboard/settings">Connect Square</Link>
          </Button>
        </section>
      ) : (
        <>
          {/* The headline */}
          <section className="on-night mt-6 rounded-lg bg-night p-5 text-white sm:p-6">
            <p className="text-sm text-on-night-muted">Extra sales from posted items this month</p>
            <p className="mt-1 text-display font-semibold">
              <Money amount={extra} tone="cash-bright" />
            </p>
            <p className="mt-1 text-sm text-on-night-muted">
              {planPrice ? (
                extra > 0 ? (
                  <>
                    That&apos;s <span className="num font-semibold text-white">{(extra / planPrice).toFixed(1)}×</span> your plan (<Money amount={planPrice} tone="white" /> a month).
                  </>
                ) : (
                  <>Your plan is <Money amount={planPrice} tone="white" /> a month.</>
                )
              ) : (
                `${done.length} ${done.length === 1 ? "post" : "posts"} measured: items sold the week each went up vs. the week before.`
              )}
            </p>
          </section>
          {!planPrice ? <PlanPriceForm /> : null}

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <section className="rounded-lg bg-white p-5">
              <h2 className="font-semibold">Best posts</h2>
              {best.length ? (
                <ol className="mt-3 space-y-3">
                  {best.map((s) => (
                    <li key={s.id} className="text-sm">
                      <div className="flex justify-between gap-3">
                        <span className="font-semibold">{s.title}</span>
                        <Money amount={s.extraDollars} sign="+" className="shrink-0 font-semibold" />
                      </div>
                      <p className="text-muted-foreground">
                        {s.kind} · {shortDate(s.weekOf)} · {s.items.map((i) => `${i.item} ${i.sold} sold (${i.before} before)`).join(", ")}
                      </p>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">Shows up after a full week of approved posts.</p>
              )}
            </section>

            <section className="rounded-lg bg-white p-5">
              <h2 className="font-semibold">Didn&apos;t move sales</h2>
              {worst.length ? (
                <ol className="mt-3 space-y-3">
                  {worst.map((s) => (
                    <li key={s.id} className="text-sm">
                      <div className="flex justify-between gap-3">
                        <span className="font-semibold">{s.title}</span>
                        <Money amount={Math.abs(s.extraDollars)} sign={s.extraDollars < 0 ? "-" : "+"} tone="ink" className="shrink-0" />
                      </div>
                      <p className="text-muted-foreground">
                        {s.kind} · {shortDate(s.weekOf)}. 2fish makes fewer like this.
                      </p>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">Needs a few weeks of posts to compare.</p>
              )}
            </section>
          </div>

          <section className="mt-6 rounded-lg bg-white p-5">
            <h2 className="font-semibold">Weekly sales</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {baseline ? (
                <>
                  Before 2fish: about <Money amount={Math.round(baseline)} tone="ink" /> a week.
                </>
              ) : (
                "Your weeks before 2fish become the starting point."
              )}
            </p>
            {rows.length ? (
              <table className="mt-4 w-full text-sm">
                <thead>
                  <tr className="text-left">
                    <th className="pb-2 font-semibold">Week of</th>
                    <th className="pb-2 text-right font-semibold">Sales</th>
                    <th className="pb-2 text-right font-semibold">vs. before</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((w) => {
                    const isBefore = !startedWeek || w.weekOf < startedWeek;
                    const change = !isBefore && baseline ? (w.amount - baseline) / baseline : null;
                    return (
                      <tr key={w.weekOf}>
                        <td className="py-1">
                          {shortDate(w.weekOf)}
                          {isBefore ? <span className="text-muted-foreground"> (before)</span> : null}
                        </td>
                        <td className="py-1 text-right">
                          <Money amount={w.amount} tone="ink" />
                        </td>
                        <td className={cn("num py-1 text-right", change !== null && change > 0 && "font-semibold text-cash")}>{change !== null ? pct(change) : ""}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">Sales show up the morning after Square connects.</p>
            )}
          </section>

          <p className="mt-6 text-sm text-muted-foreground">
            How this is counted: for each post, 2fish compares how many of its items sold the week it went up with the week before, at the items&apos; own price. Other
            things move sales too, so treat it as strong evidence, not proof.
          </p>
        </>
      )}
    </div>
  );
}

function PlanPriceForm() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [price, setPrice] = useState("");
  return (
    <form
      className="mt-4 flex flex-wrap items-end gap-2 print:hidden"
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          await setPlanPrice({ price });
          router.refresh();
        });
      }}
    >
      <div>
        <label htmlFor="plan-price" className="text-sm font-semibold">
          What this store pays a month
        </label>
        <Input id="plan-price" type="number" inputMode="numeric" min={0} required value={price} onChange={(e) => setPrice(e.target.value)} className="num mt-1 w-32" placeholder="149" />
      </div>
      <Button type="submit" variant="outline" disabled={pending}>
        Save
      </Button>
    </form>
  );
}
