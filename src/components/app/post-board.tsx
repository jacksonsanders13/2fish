"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Camera, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { approveWeek, setPostStatus } from "@/lib/pilot/actions";
import { addDays, DAYS, monthName } from "@/lib/pilot/dates";
import type { HomeData } from "@/lib/pilot/queries";
import type { Post } from "@/lib/pilot/types";
import { cn } from "@/lib/utils";
import { useDemo } from "./demo";
import { PostDialog } from "./post-dialog";

// The bottom-left panel: a switch between the posts waiting on an okay and a
// month calendar with each post in a little box on its day.
export type BoardView = "approve" | "calendar";

export function PostBoard({ home, today, view, setView }: { home: HomeData; today: string; view: BoardView; setView: (v: BoardView) => void }) {
  const [open, setOpen] = useState<Post | null>(null);
  const prev = addDays(`${home.month}-01`, -1).slice(0, 7);
  const next = addDays(`${home.month}-01`, 32).slice(0, 7);

  return (
    // On a laptop the panel fills whatever height is left and nothing inside
    // makes the page scroll. The calendar rows shrink to fit.
    <section aria-label="Your posts" className="flex flex-col rounded-lg bg-white p-4 lg:h-full lg:min-h-0">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div
          role="group"
          aria-label="Show"
          className="inline-flex rounded-md bg-surface p-1"
        >
          {(
            [
              [
                "approve",
                `Posts to approve${home.drafts.length ? ` (${home.drafts.length})` : ""}`,
              ],
              ["calendar", "Calendar"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              aria-pressed={view === key}
              onClick={() => setView(key)}
              className={cn(
                "min-h-9 rounded-[6px] px-3 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal",
                view === key
                  ? "bg-white font-semibold text-night"
                  : "text-ink hover:bg-white",
              )}
            >
              {label}
            </button>
          ))}
        </div>
        {view === "calendar" ? (
          <div className="flex items-center gap-1">
            <Button asChild size="sm" variant="ghost" className="size-9 p-0">
              <Link href={`/dashboard?month=${prev}`} scroll={false} aria-label="Last month">
                <ChevronLeft aria-hidden="true" />
              </Link>
            </Button>
            <h3 className="min-w-32 text-center text-sm font-semibold">{monthName(home.month)}</h3>
            <Button asChild size="sm" variant="ghost" className="size-9 p-0">
              <Link href={`/dashboard?month=${next}`} scroll={false} aria-label="Next month">
                <ChevronRight aria-hidden="true" />
              </Link>
            </Button>
          </div>
        ) : null}
        <Button asChild size="sm" variant="outline" className="h-9">
          <Link href="/dashboard/videos">
            <Camera aria-hidden="true" />
            Send photos
          </Link>
        </Button>
      </div>

      <div className="mt-3 flex min-h-0 flex-1 flex-col">
        {view === "approve" ? (
          <ApproveList drafts={home.drafts} onOpen={setOpen} />
        ) : (
          <Calendar home={home} today={today} onOpen={setOpen} />
        )}
      </div>

      <PostDialog post={open} onClose={() => setOpen(null)} />
    </section>
  );
}

function ApproveList({
  drafts,
  onOpen,
}: {
  drafts: Post[];
  onOpen: (p: Post) => void;
}) {
  const demo = useDemo();
  const [pending, start] = useTransition();
  const weeks = [...new Set(drafts.map((d) => d.weekOf))];

  if (!drafts.length) {
    return (
      <div className="text-sm">
        <p>
          Nothing waiting on you. Send photos and Fisher writes the
          next week of posts.
        </p>
        <Link
          href="/dashboard/videos"
          className="mt-2 inline-block font-semibold text-night underline underline-offset-2"
        >
          Send photos
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* A long week of drafts scrolls inside the panel, never the page. */}
      <ul className="min-h-0 flex-1 space-y-2 lg:overflow-y-auto">
        {drafts.map((p) => (
          <li
            key={p.id}
            className="flex items-center gap-3 rounded-md bg-surface p-2"
          >
            <button
              type="button"
              onClick={() => onOpen(p)}
              className="flex min-w-0 flex-1 items-center gap-3 rounded-md text-left focus-visible:outline-2 focus-visible:outline-signal"
            >
              {p.mediaUrl && p.isImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={p.mediaUrl}
                  alt=""
                  className="size-14 shrink-0 rounded-[4px] object-cover"
                />
              ) : (
                <span className="flex size-14 shrink-0 items-center justify-center rounded-[4px] bg-white text-sm text-muted-foreground">
                  {p.mediaUrl ? "Video" : "No photo"}
                </span>
              )}
              <span className="min-w-0">
                <span className="block text-sm text-muted-foreground">
                  {
                    DAYS[
                      (new Date(`${p.postOn}T12:00:00Z`).getUTCDay() + 6) % 7
                    ]
                  }{" "}
                  · {p.kind}
                  {p.campaign ? ` · ${p.campaign}` : ""}
                </span>
                <span className="block font-semibold">{p.title}</span>
                <span className="line-clamp-1 block text-sm">{p.hook}</span>
              </span>
            </button>
            <Button
              size="sm"
              variant="outline"
              disabled={pending}
              onClick={() =>
                demo
                  ? demo.setStatus(p.id, "approved")
                  : start(
                      async () =>
                        void (await setPostStatus({
                          id: p.id,
                          status: "approved",
                        })),
                    )
              }
              className="h-10 shrink-0"
            >
              <Check aria-hidden="true" />
              Approve
            </Button>
          </li>
        ))}
      </ul>
      {weeks.length === 1 && drafts.length > 1 ? (
        <Button
          variant="signal"
          disabled={pending}
          onClick={() =>
            demo ? demo.approveAll() : start(async () => void (await approveWeek({ weekOf: weeks[0] })))
          }
          className="mt-3 h-10 shrink-0 self-start"
        >
          Approve all {drafts.length}
        </Button>
      ) : null}
    </>
  );
}

function Calendar({
  home,
  today,
  onOpen,
}: {
  home: HomeData;
  today: string;
  onOpen: (p: Post) => void;
}) {
  const days: string[] = [];
  for (let d = home.gridStart; d <= home.gridEnd; d = addDays(d, 1))
    days.push(d);
  const byDay = new Map<string, Post[]>();
  for (const p of home.calendar)
    byDay.set(p.postOn, [...(byDay.get(p.postOn) ?? []), p]);
  const rows = days.length / 7;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div
        className="grid min-h-0 flex-1 grid-cols-7 gap-px overflow-hidden rounded-md border border-line bg-line"
        // Header row, then each week shares the height that's left.
        style={{ gridTemplateRows: `auto repeat(${rows}, minmax(0, 1fr))` }}
      >
        {DAYS.map((d) => (
          <p
            key={d}
            className="bg-surface py-1 text-center text-sm text-muted-foreground"
          >
            <span className="sm:hidden">{d[0]}</span>
            <span className="hidden sm:inline">{d}</span>
          </p>
        ))}
        {days.map((d) => {
          const inMonth = d.startsWith(home.month);
          const posts = byDay.get(d) ?? [];
          return (
            <div
              key={d}
              className={cn(
                "min-h-20 min-w-0 overflow-hidden p-1 lg:min-h-0",
                inMonth ? "bg-white" : "bg-surface",
              )}
            >
              <p
                className={cn(
                  "num text-sm",
                  d === today
                    ? "inline-flex size-5 items-center justify-center rounded-full bg-night font-semibold text-white"
                    : inMonth
                      ? ""
                      : "text-muted-foreground",
                )}
              >
                {Number(d.slice(8))}
              </p>
              <ul className="mt-0.5 space-y-0.5">
                {posts.slice(0, posts.length > 2 ? 1 : 2).map((p) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => onOpen(p)}
                      className={cn(
                        "block w-full truncate rounded-[3px] px-1 py-0.5 text-left text-xs leading-snug focus-visible:outline-2 focus-visible:outline-signal sm:px-1.5",
                        p.status === "posted"
                          ? "bg-night text-white"
                          : p.status === "approved"
                            ? "border-l-2 border-night bg-surface text-ink"
                            : "border border-dashed border-night bg-white text-night",
                        p.campaign && p.status !== "posted"
                          ? "bg-signal-soft"
                          : "",
                      )}
                      title={p.title}
                    >
                      <span className="sr-only">
                        {p.status === "draft"
                          ? "Needs okay: "
                          : p.status === "posted"
                            ? "Posted: "
                            : "Approved: "}
                      </span>
                      {p.title}
                    </button>
                  </li>
                ))}
                {posts.length > 2 ? (
                  <li>
                    <button
                      type="button"
                      onClick={() => onOpen(posts[1])}
                      className="num rounded-[3px] px-1 text-xs text-muted-foreground hover:text-night focus-visible:outline-2 focus-visible:outline-signal"
                    >
                      +{posts.length - 1} more
                    </button>
                  </li>
                ) : null}
              </ul>
            </div>
          );
        })}
      </div>

      <ul className="mt-2 flex shrink-0 flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <li className="flex items-center gap-1.5">
          <span
            className="h-3 w-4 rounded-[2px] border border-dashed border-night"
            aria-hidden="true"
          />
          Needs your okay
        </li>
        <li className="flex items-center gap-1.5">
          <span
            className="h-3 w-4 rounded-[2px] border-l-2 border-night bg-surface"
            aria-hidden="true"
          />
          Approved
        </li>
        <li className="flex items-center gap-1.5">
          <span className="h-3 w-4 rounded-[2px] bg-night" aria-hidden="true" />
          Posted
        </li>
        <li className="flex items-center gap-1.5">
          <span
            className="h-3 w-4 rounded-[2px] bg-signal-soft"
            aria-hidden="true"
          />
          Part of a campaign
        </li>
      </ul>
    </div>
  );
}
