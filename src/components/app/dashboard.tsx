"use client";

import Link from "next/link";
import { useState } from "react";
import type { Task } from "@/lib/agent/snapshot";
import type { ChatMessage } from "@/lib/agent/store";
import type { DashboardData } from "@/lib/app/queries";
import type { HomeData } from "@/lib/pilot/queries";
import { cn } from "@/lib/utils";
import { Consultant } from "./consultant";
import { PostBoard } from "./post-board";
import { SalesChart } from "./sales-chart";

type Tab = "sales" | "posts" | "chat";

// The dashboard. Left: the sales vs. posts graph on top, the posts (to approve,
// or on a calendar) under it. Right: the chat with Fisher, the 2fish helper.
// On a phone the three are tabs.
export function Dashboard({
  data,
  home,
  today,
  messages,
  tasks,
  agentReady,
  intro,
  userId,
}: {
  data: DashboardData;
  home: HomeData;
  today: string;
  messages: ChatMessage[];
  tasks: Task[];
  agentReady: boolean;
  intro: string;
  userId: string;
}) {
  const [tab, setTab] = useState<Tab>("posts");
  const { business, plan } = data;
  const who = business.name || "Your store";

  const setup = [
    { label: "Grade your store", done: Boolean(plan), href: "/audit" },
    { label: "Connect Square", done: data.setup.square, href: "/dashboard/settings" },
    { label: "Approve your first posts", done: data.setup.posts, href: "/dashboard/videos" },
  ];
  const setupLeft = setup.filter((s) => !s.done);

  const suggestions = plan
    ? ["Make next week's posts", "What's selling best?", "Which post did best?"]
    : ["What do you do?", "How does the grade work?"];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
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

      {setupLeft.length ? (
        <p className="mt-3 rounded-md border-l-4 border-signal bg-white px-3 py-2 text-sm">
          <span className="font-semibold">Still to set up:</span>{" "}
          {setupLeft.map((s, i) => (
            <span key={s.label}>
              {i ? ", " : ""}
              <Link href={s.href} className="font-semibold text-night underline underline-offset-2">
                {s.label.toLowerCase()}
              </Link>
            </span>
          ))}
        </p>
      ) : null}

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-6">
        <div className="min-w-0 space-y-4">
          <div className={cn(tab === "sales" ? "block" : "hidden lg:block")}>
            <SalesChart weeks={home.weeks} hasSales={home.hasSales} today={today} />
          </div>
          <div className={cn(tab === "posts" ? "block" : "hidden lg:block")}>
            <PostBoard home={home} today={today} />
          </div>
        </div>

        <Consultant
          initialMessages={messages}
          tasks={tasks}
          agentReady={agentReady}
          intro={intro}
          userId={userId}
          suggestions={suggestions}
          className={cn("h-[calc(100dvh-14rem)] min-h-[26rem] lg:sticky lg:top-6 lg:h-[calc(100dvh-9rem)]", tab === "chat" ? "flex" : "hidden lg:flex")}
        />
      </div>
    </div>
  );
}
