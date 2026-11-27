import Link from "next/link";
import { Money } from "@/components/ui/money";
import { money } from "@/lib/format";
import { cn } from "@/lib/utils";
import { mondayOf, shortDate } from "@/lib/pilot/dates";
import type { ChartWeek } from "@/lib/pilot/queries";

// Six weeks of sales as stacked bars: the bottom part is what the posted items
// sold, the rest is everything else in the store. Comparing the two is how we
// keep a busy season from making every post look like a winner.
export function SalesChart({
  weeks,
  hasSales,
  today,
  label = "Last 6 weeks",
  wholeRange = false,
  compact = false,
}: {
  weeks: ChartWeek[];
  hasSales: boolean;
  today: string;
  label?: string;
  wholeRange?: boolean; // sum every week (a month report) instead of quoting last week
  compact?: boolean; // shorter bars on the dashboard so everything fits on one screen
}) {
  const max = Math.max(1, ...weeks.map((w) => w.total));
  const current = mondayOf(today);
  const sum = {
    weekOf: "",
    total: weeks.reduce((s, w) => s + w.total, 0),
    posted: weeks.reduce((s, w) => s + w.posted, 0),
  };
  const lastFull = wholeRange
    ? sum
    : weeks.filter((w) => w.weekOf < current).at(-1);
  const share = (w?: ChartWeek) =>
    w && w.total ? Math.round((w.posted / w.total) * 100) : 0;

  if (compact) return <CompactChart weeks={weeks} hasSales={hasSales} current={current} max={max} lastWeek={lastFull} share={share(lastFull)} />;

  return (
    <section
      aria-labelledby="sales-h"
      className="rounded-lg bg-white p-4 sm:p-5"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="sales-h" className="font-semibold text-night">
          Sales vs. posts
        </h2>
        <div className="flex flex-wrap items-baseline gap-x-4 text-sm">
          <p className="text-muted-foreground">{label}</p>
          {!wholeRange && hasSales ? (
            <Link
              href="/dashboard/report"
              className="font-semibold text-night underline underline-offset-2"
            >
              Monthly report
            </Link>
          ) : null}
        </div>
      </div>

      {!hasSales ? (
        <div className="mt-4 rounded-md bg-surface p-4 text-sm">
          <p>
            Connect Square and this graph fills in by itself: what the items in
            your posts sold, next to everything else.
          </p>
          <Link
            href="/dashboard/settings"
            className="mt-2 inline-block font-semibold text-night underline underline-offset-2"
          >
            Connect Square
          </Link>
        </div>
      ) : (
        <>
          <p className="mt-2 text-sm">
            {wholeRange ? "This month" : "Last week"} the items in your posts
            sold{" "}
            <Money amount={lastFull?.posted ?? 0} className="font-semibold" />,
            or <span className="num font-semibold">{share(lastFull)}%</span> of
            all sales.
          </p>

          <div
            className={cn("mt-3 flex items-end gap-2 sm:gap-4", compact ? "h-24" : "h-40")}
            role="img"
            aria-label={weeks
              .map(
                (w) =>
                  `Week of ${shortDate(w.weekOf)}: ${money(w.total)} total, ${money(w.posted)} from posted items`,
              )
              .join(". ")}
          >
            {weeks.map((w) => (
              <div
                key={w.weekOf}
                className="flex h-full min-w-0 flex-1 flex-col justify-end"
              >
                <div
                  className="flex flex-col justify-end overflow-hidden rounded-t-[3px]"
                  style={{ height: `${Math.max(2, (w.total / max) * 100)}%` }}
                >
                  <div
                    className="bg-line"
                    style={{ flexGrow: Math.max(0, w.total - w.posted) }}
                  />
                  <div
                    className="bg-night"
                    style={{ flexGrow: w.posted, minHeight: w.posted ? 2 : 0 }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-1.5 flex gap-2 sm:gap-4" aria-hidden="true">
            {weeks.map((w) => (
              <p
                key={w.weekOf}
                className="num min-w-0 flex-1 truncate text-center text-sm text-muted-foreground"
              >
                {w.weekOf === current ? "This wk" : shortDate(w.weekOf)}
              </p>
            ))}
          </div>

          <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm">
            <li className="flex items-center gap-2">
              <span
                className="size-3 rounded-[2px] bg-night"
                aria-hidden="true"
              />
              Items you posted
            </li>
            <li className="flex items-center gap-2">
              <span
                className="size-3 rounded-[2px] bg-line"
                aria-hidden="true"
              />
              Everything else
            </li>
          </ul>
        </>
      )}
    </section>
  );
}

// The dashboard version: one short strip. Last week's numbers on the left,
// six small bars on the right, so the calendar and chat get the height.
function CompactChart({
  weeks: realWeeks,
  hasSales,
  current,
  max: realMax,
  lastWeek: realLast,
  share: realShare,
}: {
  weeks: ChartWeek[];
  hasSales: boolean;
  current: string;
  max: number;
  lastWeek?: ChartWeek;
  share: number;
}) {
  // Before Square is connected, show made-up numbers so the owner sees what
  // this will look like. Always labeled "Sample" so nobody takes them as real.
  const sample = !hasSales;
  const weeks = sample ? realWeeks.map((w, n) => ({ ...w, ...SAMPLE[n % SAMPLE.length] })) : realWeeks;
  const max = sample ? Math.max(1, ...weeks.map((w) => w.total)) : realMax;
  const lastWeek = sample ? weeks.filter((w) => w.weekOf < current).at(-1) : realLast;
  const share = sample
    ? lastWeek && lastWeek.total
      ? Math.round((lastWeek.posted / lastWeek.total) * 100)
      : 0
    : realShare;

  return (
    <section aria-labelledby="sales-h" className="rounded-lg bg-white px-4 py-3">
      <div className="flex items-baseline justify-between gap-2">
        <h2 id="sales-h" className="text-sm font-semibold text-night">
          Sales vs. posts
        </h2>
        {sample ? (
          <p className="flex items-baseline gap-3 text-sm">
            <span className="rounded-[4px] bg-surface px-1.5 py-0.5 text-muted-foreground">Sample</span>
            <Link href="/dashboard/settings" className="font-semibold text-night underline underline-offset-2">
              Connect Square for yours
            </Link>
          </p>
        ) : (
          <Link href="/dashboard/report" className="text-sm text-muted-foreground underline-offset-2 hover:text-night hover:underline">
            Monthly report
          </Link>
        )}
      </div>

      {
        <div className={cn("mt-2 flex items-end gap-6", sample && "opacity-70")}>
          <dl className="flex shrink-0 gap-6">
            <div>
              <dt className="text-sm text-muted-foreground">Last week</dt>
              <dd className="text-xl font-semibold">
                <Money amount={lastWeek?.total ?? 0} tone="ink" />
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">From posted items</dt>
              <dd className="text-xl font-semibold">
                <Money amount={lastWeek?.posted ?? 0} />
                <span className="num ml-1.5 text-sm font-normal text-muted-foreground">{share}%</span>
              </dd>
            </div>
          </dl>
          <div
            className="flex h-14 min-w-0 flex-1 items-end gap-1.5"
            role="img"
            aria-label={weeks
              .map((w) => `Week of ${shortDate(w.weekOf)}: ${money(w.total)} total, ${money(w.posted)} from posted items`)
              .join(". ")}
          >
            {weeks.map((w) => (
              <div
                key={w.weekOf}
                title={w.weekOf === current ? "This week" : `Week of ${shortDate(w.weekOf)}`}
                className="flex flex-1 flex-col justify-end overflow-hidden rounded-t-[2px]"
                style={{ height: `${Math.max(4, (w.total / max) * 100)}%` }}
              >
                <div className="bg-line" style={{ flexGrow: Math.max(0, w.total - w.posted) }} />
                <div className="bg-night" style={{ flexGrow: w.posted, minHeight: w.posted ? 2 : 0 }} />
              </div>
            ))}
          </div>
        </div>
      }
    </section>
  );
}

// Six made-up weeks for the sample: a small store doing about $4-5K a week,
// with the posted items' share creeping up as the posts start working.
const SAMPLE = [
  { total: 4180, posted: 290 },
  { total: 4620, posted: 410 },
  { total: 4350, posted: 520 },
  { total: 5010, posted: 760 },
  { total: 5240, posted: 880 },
  { total: 2130, posted: 390 }, // this week, still in progress
];
