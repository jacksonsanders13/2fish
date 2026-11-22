"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Check, Clock } from "lucide-react";
import { RollingMoney } from "@/components/motion/rolling-money";
import { Button } from "@/components/ui/button";
import { Money } from "@/components/ui/money";
import { StatusBadge } from "@/components/ui/status-badge";
import type { Task } from "@/lib/agent/snapshot";
import type { ChatMessage } from "@/lib/agent/store";
import type { DashboardData } from "@/lib/app/queries";
import { shortDate } from "@/lib/pilot/dates";
import { cn } from "@/lib/utils";
import { Consultant } from "./consultant";

export type AgentSummary = {
  weekOf: string;
  total: number;
  approved: number;
  posted: number;
  square: boolean;
  monthExtra: number;
  learned: string | null;
  best: { title: string; extra: number } | null;
};

// The dashboard: what the agent is doing on top, then the chat with it, and
// setup and fixes beside it. On a phone the chat and setup are tabs.
export function Dashboard({
  data,
  agent,
  messages,
  tasks,
  agentReady,
  intro,
  userId,
}: {
  data: DashboardData;
  agent: AgentSummary;
  messages: ChatMessage[];
  tasks: Task[];
  agentReady: boolean;
  intro: string;
  userId: string;
}) {
  const [tab, setTab] = useState<"chat" | "plan">("chat");
  const { business, plan } = data;
  const who = business.name || (business.kind && business.kind !== "Something else" ? business.kind : "Your business");
  const working = tasks.filter((t) => t.status === "queued" || t.status === "running");

  const setup = [
    { label: "Grade your store", done: Boolean(plan), href: "/audit" },
    { label: "Connect Square", done: data.setup.square, href: "/dashboard/settings" },
    { label: "Approve your first week of posts", done: data.setup.posts, href: "/dashboard/videos" },
  ];
  const setupLeft = setup.filter((s) => !s.done);

  const suggestions = plan
    ? ["Walk me through my fixes", "Make this week's posts", "What should I post next week?", "What's selling best?"]
    : ["What do you do?", "How does the grader work?"];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
      {/* What the agent is doing: this week's posts, what they sold, what it's changing */}
      <section className="on-night rounded-lg bg-night p-4 text-white sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="min-w-0 truncate text-sm text-on-night-muted">{who}</p>
          <div role="group" aria-label="Show" className="flex shrink-0 rounded-md border border-on-night-line p-0.5 lg:hidden">
            {(["chat", "plan"] as const).map((t) => (
              <button
                key={t}
                type="button"
                aria-pressed={tab === t}
                onClick={() => setTab(t)}
                className={cn(
                  "rounded-[6px] px-3 py-1.5 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white active:bg-night-deep",
                  tab === t ? "bg-white font-semibold text-night active:bg-white" : "text-white",
                )}
              >
                {t === "chat" ? "Agent" : "Setup"}
              </button>
            ))}
          </div>
        </div>
        <h1 className="sr-only">What 2fish is doing for {who}</h1>
        <div className="mt-3 grid gap-4 sm:grid-cols-3">
          <Link href="/dashboard/videos" className="rounded-md focus-visible:outline-2 focus-visible:outline-white">
            <p className="text-sm text-on-night-muted">Posts, week of {shortDate(agent.weekOf)}</p>
            <p className="mt-1 text-lg font-semibold">
              {agent.total === 0 ? (
                "Not written yet"
              ) : (
                <>
                  <span className="num">{agent.approved}</span> of <span className="num">{agent.total}</span> approved
                </>
              )}
            </p>
            <p className="text-sm text-on-night-muted">
              {agent.total === 0 ? "Send photos to start" : agent.approved < agent.total ? "Tap to review" : `${agent.posted} posted so far`}
            </p>
          </Link>
          <div>
            <p className="text-sm text-on-night-muted">Extra sales from posts this month</p>
            <p className="mt-1 text-lg font-semibold">
              {agent.square ? <RollingMoney amount={agent.monthExtra} tone="cash-bright" /> : "Connect Square"}
            </p>
            <p className="text-sm text-on-night-muted">
              {agent.square ? (agent.best ? `Best: ${agent.best.title}` : "Posted items vs. the week before") : "So 2fish can see what sold"}
            </p>
          </div>
          <div>
            <p className="text-sm text-on-night-muted">What it&apos;s changing</p>
            <p className="mt-1 text-sm">{agent.learned ?? "Needs about 2 weeks of posts and sales before it knows what works for your store."}</p>
          </div>
        </div>
      </section>
      <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_360px]">
        <Consultant
          initialMessages={messages}
          tasks={tasks}
          agentReady={agentReady}
          intro={intro}
          userId={userId}
          suggestions={suggestions}
          className={cn("h-[calc(100dvh-19rem)] min-h-[26rem] lg:h-[calc(100dvh-12.5rem)]", tab === "chat" ? "flex" : "hidden lg:flex")}
        />

        <aside className={cn("space-y-4", tab === "plan" ? "block" : "hidden lg:block")}>
          {setupLeft.length ? (
            <section className="rounded-lg border-t-4 border-signal bg-white p-4">
              <h2 className="text-sm font-semibold text-night">
                Get set up <span className="num font-normal text-muted-foreground">({3 - setupLeft.length} of 3 done)</span>
              </h2>
              <ol className="mt-2 space-y-1">
                {setup.map((s) => (
                  <li key={s.label} className="flex items-center gap-2 py-1 text-sm">
                    {s.done ? <Check size={16} className="shrink-0 text-cash" aria-hidden="true" /> : <span className="size-4 shrink-0 rounded-full border-2 border-line" aria-hidden="true" />}
                    {s.done ? (
                      <span className="text-muted-foreground line-through">{s.label}</span>
                    ) : (
                      <Link href={s.href} className="font-semibold text-night underline underline-offset-2">
                        {s.label}
                      </Link>
                    )}
                    <span className="sr-only">{s.done ? "(done)" : "(to do)"}</span>
                  </li>
                ))}
              </ol>
            </section>
          ) : null}

          <section className="rounded-lg border-t-4 border-night bg-white p-4">
            <h2 className="text-sm font-semibold text-night">Your fixes</h2>
            {plan ? (
              <>
                <p className="mt-1 text-sm text-muted-foreground">
                  Worth about <Money amount={plan.totalMonthly} tone="ink" className="font-semibold" /> a month. Biggest first.
                </p>
                <ol className="mt-3 divide-y divide-line">
                  {plan.steps.map((s) => (
                    <li key={s.id} className="py-3 first:pt-0 last:pb-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="min-w-0 text-sm font-semibold">
                          <span className="num mr-1.5 text-night">{s.rank}</span>
                          {s.title}
                        </p>
                        <StatusBadge status={s.status} className="shrink-0" />
                      </div>
                      <div className="mt-1 flex items-center justify-between gap-2 text-sm">
                        <Money amount={s.impact} per="/mo" sign="+" className="font-semibold" />
                        <Link href={s.href} className="font-semibold text-night underline underline-offset-2 hover:text-night-tint">
                          Open
                        </Link>
                      </div>
                    </li>
                  ))}
                </ol>
              </>
            ) : (
              <>
                <p className="mt-1 text-sm">Six questions, about 2 minutes, then 2fish has something to work with.</p>
                <Button asChild size="sm" variant="signal" className="mt-3">
                  <Link href="/audit">
                    Get your free store grade
                    <ArrowRight aria-hidden="true" />
                  </Link>
                </Button>
              </>
            )}
          </section>

          {working.length ? (
            <section className="rounded-lg border-t-4 border-night bg-white p-4">
              <h2 className="text-sm font-semibold text-night">In progress</h2>
              <ul className="mt-2 space-y-2">
                {working.map((t) => (
                  <li key={t.id} className="flex items-start gap-2 text-sm">
                    <Clock size={14} className="mt-1 shrink-0 text-night" aria-hidden="true" />
                    <div>
                      <p className="font-semibold">{t.title}</p>
                      {typeof t.result.note === "string" ? <p className="text-muted-foreground">{t.result.note}</p> : null}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
