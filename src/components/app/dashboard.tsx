"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { shortDate } from "@/lib/pilot/dates";
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
    { label: "Grade your store", done: Boolean(plan), href: "/audit" },
    { label: "Send Fisher a few photos", done: data.setup.posts, href: "/dashboard/videos" },
    { label: "Connect Square", done: data.setup.square, href: "/dashboard/settings" },
  ];
  const nextStep = setup.find((s) => !s.done);

  // Shown in the title row once setup is done.
  const nextPost = home.calendar
    .filter((p) => p.status === "approved" && p.postOn >= today)
    .sort((a, b) => a.postOn.localeCompare(b.postOn))[0];

  const suggestions = !nextStep
    ? ["Make next week's posts", "What's selling best?", "Which post did best?"]
    : ["Where do I start?", "What do you do for me?", "Make me a poster"];

  return (
    <div className="mx-auto flex w-full max-w-[96rem] flex-col px-4 py-4 sm:px-6 lg:h-[calc(100dvh-4rem)] lg:px-6 lg:py-4">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        <h1 className="text-lg font-semibold text-night">{who}</h1>
        {nextStep ? (
          // Until setup is done, one line says what to do next. The dots show
          // how far along they are without three big cards.
          <Link
            href={nextStep.href}
            className="group flex min-w-0 items-center gap-3 rounded-md text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
          >
            <span className="flex items-center gap-1" aria-hidden="true">
              {setup.map((st) => (
                <span key={st.label} className={cn("size-2 rounded-full", st.done ? "bg-night" : st === nextStep ? "bg-signal" : "bg-line")} />
              ))}
            </span>
            <span className="num text-muted-foreground">
              Step {setup.indexOf(nextStep) + 1} of {setup.length}
            </span>
            <span className="truncate font-semibold text-night group-hover:underline group-hover:underline-offset-2">{nextStep.label}</span>
            <ArrowRight size={16} className="shrink-0 text-signal" aria-hidden="true" />
          </Link>
        ) : nextPost ? (
          <p className="text-sm text-muted-foreground">
            Next post goes up <span className="num font-semibold text-ink">{nextPost.postOn === today ? "today" : shortDate(nextPost.postOn)}</span>
          </p>
        ) : null}
        <div role="group" aria-label="Show" className="ml-auto flex rounded-md bg-white p-1 lg:hidden">
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

      <div className="mt-3 grid min-h-0 flex-1 gap-4 lg:grid-cols-2 lg:grid-rows-[minmax(0,1fr)]">
        {/* Sales strip on top, posts panel takes the rest. Nothing here scrolls the page. */}
        <div className="flex min-w-0 flex-col gap-3 lg:min-h-0">
          <div className={cn("shrink-0", tab === "sales" ? "block" : "hidden lg:block")}>
            <SalesChart weeks={home.weeks} hasSales={home.hasSales} today={today} compact />
          </div>
          <div className={cn("lg:min-h-0 lg:flex-1", tab === "posts" ? "block" : "hidden lg:block")}>
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

