"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { Money } from "@/components/ui/money";
import { mondayOf, shortDate } from "@/lib/pilot/dates";
import type { Task } from "@/lib/agent/snapshot";
import type { ChatMessage, ChatSummary } from "@/lib/agent/store";
import type { DashboardData } from "@/lib/app/queries";
import type { HomeData } from "@/lib/pilot/queries";
import { cn } from "@/lib/utils";
import { Consultant } from "./consultant";
import { PostBoard, type BoardView } from "./post-board";
import { SalesChart } from "./sales-chart";

type Tab = "sales" | "posts" | "chat";

// The dashboard. Left: the sales vs. posts graph on top, the posts (to approve,
// or on a calendar) under it. Right: the chat with Fisher, the marketing helper.
// On a phone the three are tabs.
export function Dashboard({
  data,
  home,
  today,
  messages,
  chats,
  conversationId,
  firstEver,
  tasks,
  agentReady,
  intro,
  userId,
}: {
  data: DashboardData;
  home: HomeData;
  today: string;
  messages: ChatMessage[];
  chats: ChatSummary[];
  conversationId: string | null;
  firstEver: boolean;
  tasks: Task[];
  agentReady: boolean;
  intro: string;
  userId: string;
}) {
  const [tab, setTab] = useState<Tab>("posts");
  const [board, setBoard] = useState<BoardView>(home.drafts.length ? "approve" : "calendar");
  const { business, plan } = data;
  const who = business.name || "Your store";

  const setup = [
    { label: "Grade your store", hint: "Takes 2 minutes", done: Boolean(plan), href: "/audit" },
    { label: "Send Fisher a few photos", hint: "He writes your week of posts", done: data.setup.posts, href: "/dashboard/videos" },
    { label: "Connect Square", hint: "So we can show what sold", done: data.setup.square, href: "/dashboard/settings" },
  ];
  const nextStep = setup.find((s) => !s.done);

  // The four numbers across the top.
  const current = mondayOf(today);
  const lastWeek = home.weeks.filter((w) => w.weekOf < current).at(-1);
  const nextPost = home.calendar
    .filter((p) => p.status === "approved" && p.postOn >= today)
    .sort((a, b) => a.postOn.localeCompare(b.postOn))[0];

  const suggestions = !nextStep
    ? ["Make next week's posts", "What's selling best?", "Which post did best?"]
    : ["Where do I start?", "What do you do for me?", "Make me a poster"];

  return (
    <div className="mx-auto flex w-full max-w-[96rem] flex-col px-4 py-4 sm:px-6 lg:h-[calc(100dvh-4rem)] lg:px-8 lg:py-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-semibold text-night">{who}</h1>
        <div role="group" aria-label="Show" className="flex rounded-md bg-white p-1 lg:hidden">
          {(
            [
              ["sales", "Sales"],
              ["posts", "Posts"],
              ["chat", "Fisher"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              aria-pressed={tab === key}
              onClick={() => setTab(key)}
              className={cn(
                "min-h-10 rounded-[6px] px-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal",
                tab === key ? "bg-night font-semibold text-white" : "text-ink",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {nextStep ? (
        // Until setup is done: three numbered steps, the next one in coral,
        // so a first-time owner never has to guess what to do.
        <ol aria-label="Start here" className="mt-3 grid gap-2 sm:grid-cols-3">
          {setup.map((s, i) => {
            const isNext = s === nextStep;
            return (
              <li key={s.label}>
                <Link
                  href={s.href}
                  aria-current={isNext ? "step" : undefined}
                  className={cn(
                    "flex h-full items-center gap-3 rounded-md border bg-white px-3 py-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal",
                    isNext ? "border-signal" : "border-line",
                    s.done && "opacity-60",
                  )}
                >
                  <span
                    className={cn(
                      "num flex size-7 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
                      s.done ? "bg-night text-white" : isNext ? "bg-signal text-white" : "bg-surface text-night",
                    )}
                    aria-hidden="true"
                  >
                    {s.done ? <Check size={14} /> : i + 1}
                  </span>
                  <span className="min-w-0">
                    <span className={cn("block text-sm font-semibold text-night", s.done && "line-through")}>
                      {s.label}
                      {s.done ? <span className="sr-only"> (done)</span> : null}
                    </span>
                    <span className="block truncate text-sm text-muted-foreground">{isNext ? `Start here. ${s.hint}` : s.hint}</span>
                  </span>
                  {isNext ? <ArrowRight size={16} className="ml-auto shrink-0 text-signal" aria-hidden="true" /> : null}
                </Link>
              </li>
            );
          })}
        </ol>
      ) : null}

      <dl className={cn("mt-3 grid grid-cols-2 gap-2 lg:grid-cols-4 lg:gap-3", tab === "chat" && "hidden lg:grid")}>
        <Stat label="Sales last week">
          {home.hasSales ? <Money amount={lastWeek?.total ?? 0} tone="ink" /> : <Empty />}
        </Stat>
        <Stat label="From items you posted">
          {home.hasSales ? <Money amount={lastWeek?.posted ?? 0} /> : <Empty />}
        </Stat>
        <Stat label="Waiting for your okay">
          <button
            type="button"
            onClick={() => {
              setBoard("approve");
              setTab("posts");
            }}
            className={cn(
              "num rounded-sm text-left focus-visible:outline-2 focus-visible:outline-signal",
              home.drafts.length ? "text-signal underline-offset-4 hover:underline" : "text-ink",
            )}
          >
            {home.drafts.length} {home.drafts.length === 1 ? "post" : "posts"}
          </button>
        </Stat>
        <Stat label="Next post goes up">
          {nextPost ? <span className="num">{nextPost.postOn === today ? "Today" : shortDate(nextPost.postOn)}</span> : <Empty />}
        </Stat>
      </dl>

      <div className="mt-3 grid min-h-0 flex-1 gap-4 lg:grid-cols-2 lg:gap-5">
        {/* The left side scrolls on its own, so the chat box never leaves the screen. */}
        <div className="min-w-0 space-y-3 lg:min-h-0 lg:overflow-y-auto lg:pr-1">
          <div className={cn(tab === "sales" ? "block" : "hidden lg:block")}>
            <SalesChart weeks={home.weeks} hasSales={home.hasSales} today={today} compact />
          </div>
          <div className={cn(tab === "posts" ? "block" : "hidden lg:block")}>
            <PostBoard home={home} today={today} view={board} setView={setBoard} />
          </div>
        </div>

        <Consultant
          // A different chat is a fresh conversation on screen.
          key={conversationId ?? "new"}
          chats={chats}
          conversationId={conversationId}
          firstEver={firstEver}
          initialMessages={messages}
          tasks={tasks}
          agentReady={agentReady}
          intro={intro}
          userId={userId}
          suggestions={suggestions}
          // When Fisher makes posts, show them where the owner approves them.
          onMadePosts={() => setBoard("approve")}
          className={cn("h-[calc(100dvh-13rem)] min-h-[24rem] lg:h-full lg:min-h-0", tab === "chat" ? "flex" : "hidden lg:flex")}
        />
      </div>
    </div>
  );
}

function Stat({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg bg-white px-4 py-3">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-xl font-semibold text-ink">{children}</dd>
    </div>
  );
}

function Empty() {
  return <span className="text-muted-foreground">Not yet</span>;
}
