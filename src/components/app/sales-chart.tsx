import Link from "next/link";
import { Money } from "@/components/ui/money";
import { money } from "@/lib/format";
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
}: {
  weeks: ChartWeek[];
  hasSales: boolean;
  today: string;
  label?: string;
  wholeRange?: boolean; // sum every week (a month report) instead of quoting last week
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
            className="mt-4 flex h-40 items-end gap-2 sm:gap-4"
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
