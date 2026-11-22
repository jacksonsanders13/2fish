"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Clock } from "lucide-react";
import { RollingMoney } from "@/components/motion/rolling-money";
import { Button } from "@/components/ui/button";
import { Money } from "@/components/ui/money";
import { StatusBadge } from "@/components/ui/status-badge";
import type { Task } from "@/lib/agent/snapshot";
import type { ChatMessage } from "@/lib/agent/store";
import type { DashboardData } from "@/lib/app/queries";
import { cn } from "@/lib/utils";
import { Consultant } from "./consultant";

// The dashboard is the consultant's room: the conversation in the middle,
// the numbers and the plan beside it. On a phone the two are tabs.
export function Dashboard({
  data,
  messages,
  tasks,
  agentReady,
  intro,
  userId,
}: {
  data: DashboardData;
  messages: ChatMessage[];
  tasks: Task[];
  agentReady: boolean;
  intro: string;
  userId: string;
}) {
  const [tab, setTab] = useState<"chat" | "plan">("chat");
  const { business, plan, recovered } = data;
  const who = business.name || (business.kind && business.kind !== "Something else" ? business.kind : "Your business");
  const working = tasks.filter((t) => t.status === "queued" || t.status === "running");

  const suggestions = plan
    ? ["Walk me through my fixes", "Make this week's posts", "Someone used a code today", "What's selling best?"]
    : ["What do you do?", "How does the grader work?"];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
      {/* Teal stat strip: the one number the owner cares about */}
      <div className="on-night flex items-center justify-between gap-3 rounded-lg bg-night px-4 py-3.5 text-white sm:px-5">
        <div className="min-w-0">
          <p className="truncate text-sm text-on-night-muted">{who}</p>
          <h1 className="font-semibold">
            Tracked sales this month: <RollingMoney amount={recovered.month} tone="cash-bright" />
          </h1>
        </div>
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
              {t === "chat" ? "Consultant" : "Plan"}
            </button>
          ))}
        </div>
      </div>

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
                    Grade my store free
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
