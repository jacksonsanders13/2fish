"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { ChevronLeft, ChevronRight, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Money } from "@/components/ui/money";
import { saveItemSales, saveWeeklySales, setPlanPrice } from "@/lib/pilot/actions";
import { addDays, mondayOf, monthName, shortDate } from "@/lib/pilot/dates";
import type { ReportData } from "@/lib/pilot/queries";
import { SOURCES } from "@/lib/pilot/types";
import { cn } from "@/lib/utils";

function shiftMonth(ym: string, n: number) {
  const d = new Date(`${ym}-01T12:00:00Z`);
  d.setUTCMonth(d.getUTCMonth() + n);
  return d.toISOString().slice(0, 7);
}

function pct(n: number) {
  return `${n >= 0 ? "+" : ""}${Math.round(n * 100)}%`;
}

// The monthly proof report. Three signals, no promo codes: what shoppers said at
// checkout, what the posted items sold, and weekly sales against before 2fish.
export function ReportView({ data }: { data: ReportData }) {
  const { checkouts, planPrice, weekly, itemSales, posts, startedWeek, month, today } = data;

  const fromPosts = checkouts.filter((c) => c.source === "post");
  const postTotal = fromPosts.reduce((s, c) => s + c.amount, 0);
  const allTotal = checkouts.reduce((s, c) => s + c.amount, 0);

  const bySource = SOURCES.map((s) => {
    const rows = checkouts.filter((c) => c.source === s.id);
    return { ...s, count: rows.length, amount: rows.reduce((t, c) => t + c.amount, 0) };
  });
  const maxSource = Math.max(1, ...bySource.map((s) => s.count));

  // Best post: the one shoppers named most in dollars. Otherwise the item with the biggest jump.
  const best = useMemo(() => {
    const sums = new Map<string, number>();
    for (const c of fromPosts) if (c.postId) sums.set(c.postId, (sums.get(c.postId) ?? 0) + c.amount);
    const top = [...sums.entries()].sort((a, b) => b[1] - a[1])[0];
    if (top) return { label: posts.find((p) => p.id === top[0])?.label ?? "A post from this month", detail: <><Money amount={top[1]} className="font-semibold" /> from shoppers who named it</> };
    const item = [...itemSales].sort((a, b) => b.sold - b.soldBefore - (a.sold - a.soldBefore))[0];
    if (item && item.sold > item.soldBefore) return { label: item.item, detail: <>{item.sold} sold the week it was posted, up from {item.soldBefore}</> };
    return null;
  }, [fromPosts, itemSales, posts]);

  // Baseline: the last 4 weeks typed in before the first approved pack.
  const sortedWeeks = [...weekly].sort((a, b) => (a.weekOf < b.weekOf ? -1 : 1));
  const before = startedWeek ? sortedWeeks.filter((w) => w.weekOf < startedWeek) : sortedWeeks;
  const baseWeeks = before.slice(-4);
  const baseline = baseWeeks.length ? baseWeeks.reduce((s, w) => s + w.amount, 0) / baseWeeks.length : null;
  const monthWeeks = sortedWeeks.filter((w) => w.weekOf.slice(0, 7) === month && (!startedWeek || w.weekOf >= startedWeek));
  const monthSales = monthWeeks.reduce((s, w) => s + w.amount, 0);
  const lift = baseline && monthWeeks.length ? monthSales - baseline * monthWeeks.length : null;

  const itemsThisMonth = itemSales.filter((r) => data.weeks.includes(r.weekOf) || r.weekOf.slice(0, 7) === month);
  const itemSold = itemsThisMonth.reduce((s, r) => s + r.sold, 0);
  const itemBefore = itemsThisMonth.reduce((s, r) => s + r.soldBefore, 0);

  return (
    <div className="report">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-display font-semibold">{data.business.name || "Your store"}: {monthName(month)}</h1>
          <p className="mt-2 text-sm text-muted-foreground">What your posts sold this month, from what shoppers told you at checkout and what you counted.</p>
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

      {/* The headline numbers */}
      <section className="on-night mt-6 grid gap-6 rounded-lg bg-night p-5 text-white sm:grid-cols-3 sm:p-6">
        <div>
          <p className="text-sm text-on-night-muted">Sales from shoppers who saw a post</p>
          <p className="mt-1 text-display font-semibold">
            <Money amount={postTotal} tone="cash-bright" />
          </p>
          <p className="text-sm text-on-night-muted">
            {fromPosts.length} {fromPosts.length === 1 ? "shopper" : "shoppers"}, out of {checkouts.length} asked
          </p>
        </div>
        <div>
          <p className="text-sm text-on-night-muted">Posted items sold</p>
          <p className="num mt-1 text-display font-semibold">{itemSold}</p>
          <p className="text-sm text-on-night-muted">{!itemsThisMonth.length ? "Count them below" : itemBefore ? `${pct((itemSold - itemBefore) / itemBefore)} on the weeks before` : `${itemBefore} the weeks before`}</p>
        </div>
        <div>
          <p className="text-sm text-on-night-muted">Weekly sales vs. before 2fish</p>
          <p className="num mt-1 text-display font-semibold">{lift !== null && baseline ? pct(lift / (baseline * monthWeeks.length)) : "None yet"}</p>
          <p className="text-sm text-on-night-muted">
            {baseline ? <>Before: <Money amount={Math.round(baseline)} tone="white" /> a week</> : "Add 4 weeks from before you started"}
          </p>
        </div>
      </section>

      {planPrice ? (
        <p className="mt-4">
          Your plan is <Money amount={planPrice} tone="ink" className="font-semibold" /> a month.{" "}
          {postTotal > 0 ? (
            <>
              Shoppers from posts spent <span className="num font-semibold">{(postTotal / planPrice).toFixed(1)}×</span> that.
            </>
          ) : (
            "Log checkouts to see what it brings back."
          )}
        </p>
      ) : (
        <PlanPriceForm />
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg bg-white p-5">
          <h2 className="font-semibold">How shoppers heard about you</h2>
          {checkouts.length ? (
            <ul className="mt-4 space-y-3">
              {bySource.map((s) => (
                <li key={s.id} className="text-sm">
                  <div className="flex justify-between gap-3">
                    <span className={cn(s.id === "post" && "font-semibold")}>{s.label}</span>
                    <span className="num">
                      {s.count} · <Money amount={s.amount} tone={s.id === "post" ? "cash" : "ink"} />
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 rounded-full bg-surface">
                    <div className={cn("h-full rounded-full", s.id === "post" ? "bg-cash" : "bg-night")} style={{ width: `${(s.count / maxSource) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">No checkouts logged this month. Use the Checkout screen at the register.</p>
          )}
          <p className="mt-4 text-sm text-muted-foreground">
            <Money amount={allTotal} tone="ink" /> logged in all.
          </p>
        </section>

        <section className="rounded-lg bg-white p-5">
          <h2 className="font-semibold">Best post</h2>
          {best ? (
            <>
              <p className="mt-2 text-lg font-semibold">{best.label}</p>
              <p className="mt-1 text-sm">{best.detail}</p>
            </>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">Shows up once shoppers name a post at checkout or you count posted items.</p>
          )}
        </section>
      </div>

      <ItemsSection data={data} />
      <WeeklySection data={data} baseline={baseline} />
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
        <Input id="plan-price" type="number" inputMode="numeric" min={0} required value={price} onChange={(e) => setPrice(e.target.value)} className="num mt-1 w-32" placeholder="49" />
      </div>
      <Button type="submit" variant="outline" disabled={pending}>
        Save
      </Button>
    </form>
  );
}

function ItemsSection({ data }: { data: ReportData }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const weeksWithPosts = [...new Set(data.posts.filter((p) => p.live).map((p) => p.weekOf))].filter((w) => w <= data.today);
  const [week, setWeek] = useState(weeksWithPosts[weeksWithPosts.length - 1] ?? "");
  const items = [...new Set(data.posts.filter((p) => p.weekOf === week).flatMap((p) => p.items))];
  const saved = new Map(data.itemSales.filter((r) => r.weekOf === week).map((r) => [r.item, r]));
  const [counts, setCounts] = useState<Record<string, { sold: string; soldBefore: string }>>({});
  const [msg, setMsg] = useState<string | null>(null);

  if (data.square) {
    const rows = [...data.itemSales].sort((a, b) => (a.weekOf < b.weekOf ? 1 : -1));
    return (
      <section className="mt-6 rounded-lg bg-white p-5">
        <h2 className="font-semibold">Posted items sold</h2>
        <p className="mt-1 text-sm text-muted-foreground">Counted from Square: the week each item was posted, and the week before.</p>
        {rows.length ? (
          <table className="mt-4 w-full text-sm">
            <thead>
              <tr className="text-left">
                <th className="pb-2 font-semibold">Item</th>
                <th className="pb-2 font-semibold">Posted</th>
                <th className="pb-2 text-right font-semibold">That week</th>
                <th className="pb-2 text-right font-semibold">Before</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={`${r.weekOf}|${r.item}`}>
                  <td className="py-1 pr-2">{r.item}</td>
                  <td className="py-1 pr-2">{shortDate(r.weekOf)}</td>
                  <td className={cn("num py-1 text-right", r.sold > r.soldBefore && "font-semibold text-cash")}>{r.sold}</td>
                  <td className="num py-1 text-right">{r.soldBefore}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">Shows up once a week of approved posts has run.</p>
        )}
      </section>
    );
  }

  const val = (item: string, k: "sold" | "soldBefore") => counts[`${week}|${item}`]?.[k] ?? String(saved.get(item)?.[k] ?? "");
  const set = (item: string, k: "sold" | "soldBefore", v: string) =>
    setCounts((c) => ({ ...c, [`${week}|${item}`]: { sold: val(item, "sold"), soldBefore: val(item, "soldBefore"), [k]: v } }));

  return (
    <section className="mt-6 rounded-lg bg-white p-5">
      <h2 className="font-semibold">Posted items sold</h2>
      <p className="mt-1 text-sm text-muted-foreground">Check your register&apos;s item report and count each one: the week it was posted, and the week before.</p>
      {weeksWithPosts.length ? (
        <form
          className="mt-4"
          onSubmit={(e) => {
            e.preventDefault();
            start(async () => {
              const r = await saveItemSales({ weekOf: week, rows: items.map((item) => ({ item, sold: val(item, "sold") || 0, soldBefore: val(item, "soldBefore") || 0 })) });
              setMsg(r.ok ? "Saved." : r.message);
              router.refresh();
            });
          }}
        >
          <label htmlFor="items-week" className="text-sm font-semibold">
            Week of
          </label>
          <select id="items-week" value={week} onChange={(e) => setWeek(e.target.value)} className="ml-2 h-9 rounded-md border border-input bg-white px-2 text-sm">
            {weeksWithPosts.map((w) => (
              <option key={w} value={w}>
                {shortDate(w)}
              </option>
            ))}
          </select>
          {items.length ? (
            <table className="mt-4 w-full text-sm">
              <thead>
                <tr className="text-left">
                  <th className="pb-2 font-semibold">Item</th>
                  <th className="w-24 pb-2 font-semibold">That week</th>
                  <th className="w-24 pb-2 font-semibold">Week before</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item}>
                    <td className="py-1 pr-2">{item}</td>
                    <td className="py-1 pr-2">
                      <Input type="number" inputMode="numeric" min={0} aria-label={`${item}, sold that week`} value={val(item, "sold")} onChange={(e) => set(item, "sold", e.target.value)} className="num h-9" />
                    </td>
                    <td className="py-1">
                      <Input type="number" inputMode="numeric" min={0} aria-label={`${item}, sold the week before`} value={val(item, "soldBefore")} onChange={(e) => set(item, "soldBefore", e.target.value)} className="num h-9" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">That week&apos;s posts don&apos;t list any items. Add them on the Posts page.</p>
          )}
          {items.length ? (
            <div className="mt-3 flex items-center gap-3 print:hidden">
              <Button type="submit" variant="outline" disabled={pending}>
                Save counts
              </Button>
              {msg ? <span className="text-sm" role="status">{msg}</span> : null}
            </div>
          ) : null}
        </form>
      ) : (
        <p className="mt-3 text-sm text-muted-foreground">Once a week of posts is approved, its items show up here to count.</p>
      )}
    </section>
  );
}

function WeeklySection({ data, baseline }: { data: ReportData; baseline: number | null }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  // The last 10 finished weeks, newest first.
  const lastMonday = addDays(mondayOf(data.today), -7);
  const options = Array.from({ length: 10 }, (_, i) => addDays(lastMonday, -7 * i));
  const [week, setWeek] = useState(options[0]);
  const [amount, setAmount] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const rows = [...data.weekly].sort((a, b) => (a.weekOf < b.weekOf ? 1 : -1)).slice(0, 12);

  return (
    <section className="mt-6 rounded-lg bg-white p-5">
      <h2 className="font-semibold">Weekly sales</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Your register&apos;s total for each week, Monday to Sunday. The 4 weeks before your first approved posts are the &quot;before&quot; number.
      </p>
      {data.square ? <p className="mt-2 text-sm font-semibold">From Square, updated every morning.</p> : null}
      <form
        className={cn("mt-4 flex flex-wrap items-end gap-2 print:hidden", data.square && "hidden")}
        onSubmit={(e) => {
          e.preventDefault();
          start(async () => {
            const r = await saveWeeklySales({ weekOf: week, amount });
            setMsg(r.ok ? `Saved the week of ${shortDate(week)}.` : r.message);
            if (r.ok) setAmount("");
            router.refresh();
          });
        }}
      >
        <div>
          <label htmlFor="ws-week" className="text-sm font-semibold">
            Week of
          </label>
          <select id="ws-week" value={week} onChange={(e) => setWeek(e.target.value)} className="mt-1 block h-10 rounded-md border border-input bg-white px-2 text-sm">
            {options.map((w) => (
              <option key={w} value={w}>
                {shortDate(w)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="ws-amount" className="text-sm font-semibold">
            Total sales
          </label>
          <div className="mt-1 flex h-10 w-40 items-center rounded-md border border-input bg-white pl-3 focus-within:border-night">
            <span className="text-muted-foreground">$</span>
            <Input id="ws-amount" type="number" inputMode="numeric" min={0} required value={amount} onChange={(e) => setAmount(e.target.value)} className="num h-full border-0 bg-transparent pl-1 shadow-none focus-visible:ring-0" />
          </div>
        </div>
        <Button type="submit" variant="outline" disabled={pending}>
          Save
        </Button>
        {msg ? <span className="text-sm" role="status">{msg}</span> : null}
      </form>

      {rows.length ? (
        <table className="mt-5 w-full text-sm">
          <thead>
            <tr className="text-left">
              <th className="pb-2 font-semibold">Week of</th>
              <th className="pb-2 text-right font-semibold">Sales</th>
              <th className="pb-2 text-right font-semibold">vs. before</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((w) => {
              const isBefore = !data.startedWeek || w.weekOf < data.startedWeek;
              return (
                <tr key={w.weekOf}>
                  <td className="py-1">
                    {shortDate(w.weekOf)}
                    {isBefore ? <span className="text-muted-foreground"> (before)</span> : null}
                  </td>
                  <td className="py-1 text-right">
                    <Money amount={w.amount} tone="ink" />
                  </td>
                  <td className="num py-1 text-right">{!isBefore && baseline ? pct((w.amount - baseline) / baseline) : ""}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : null}
    </section>
  );
}
