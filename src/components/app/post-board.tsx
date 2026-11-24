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
import { PostDialog } from "./post-dialog";

// The bottom-left panel: a switch between the posts waiting on an okay and a
// month calendar with each post in a little box on its day.
export function PostBoard({ home, today }: { home: HomeData; today: string }) {
  const [view, setView] = useState<"approve" | "calendar">(
    home.drafts.length ? "approve" : "calendar",
  );
  const [open, setOpen] = useState<Post | null>(null);

  return (
    <section aria-label="Your posts" className="rounded-lg bg-white p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
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
                "min-h-10 rounded-[6px] px-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal",
                view === key
                  ? "bg-white font-semibold text-night"
                  : "text-ink hover:bg-white",
              )}
            >
              {label}
            </button>
          ))}
        </div>
        <Button asChild size="sm" variant="outline" className="h-10">
          <Link href="/dashboard/videos">
            <Camera aria-hidden="true" />
            Send photos
          </Link>
        </Button>
      </div>

      <div className="mt-4">
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
      <ul className="space-y-2">
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
                start(
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
            start(async () => void (await approveWeek({ weekOf: weeks[0] })))
          }
          className="mt-4 h-11"
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
  const prev = addDays(`${home.month}-01`, -1).slice(0, 7);
  const next = addDays(`${home.month}-01`, 32).slice(0, 7);

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-semibold">{monthName(home.month)}</h3>
        <div className="flex gap-1">
          <Button asChild size="sm" variant="outline" className="size-10 p-0">
            <Link
              href={`/dashboard?month=${prev}`}
              scroll={false}
              aria-label="Last month"
            >
              <ChevronLeft aria-hidden="true" />
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="size-10 p-0">
            <Link
              href={`/dashboard?month=${next}`}
              scroll={false}
              aria-label="Next month"
            >
              <ChevronRight aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-7 gap-px overflow-hidden rounded-md border border-line bg-line">
        {DAYS.map((d) => (
          <p
            key={d}
            className="bg-surface py-1.5 text-center text-sm font-semibold"
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
                "min-h-20 min-w-0 p-1 sm:min-h-24 sm:p-1.5",
                inMonth ? "bg-white" : "bg-surface",
              )}
            >
              <p
                className={cn(
                  "num text-sm",
                  d === today
                    ? "inline-flex size-6 items-center justify-center rounded-full bg-night font-semibold text-white"
                    : inMonth
                      ? ""
                      : "text-muted-foreground",
                )}
              >
                {Number(d.slice(8))}
              </p>
              <ul className="mt-1 space-y-1">
                {posts.map((p) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => onOpen(p)}
                      className={cn(
                        "block w-full truncate rounded-[3px] px-1 py-0.5 text-left text-xs leading-snug focus-visible:outline-2 focus-visible:outline-signal sm:px-1.5 sm:text-sm",
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
              </ul>
            </div>
          );
        })}
      </div>

      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
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
