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
    ? ["Walk me through my plan", "Turn on text-back", "I'm not posting enough", "I won a job today"]
    : ["What do you do?", "How does the audit work?"];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">{who}</p>
          <h1 className="font-bold">
            Recovered this month: <RollingMoney amount={recovered.month} />
          </h1>
        </div>
        <div className="flex rounded-md border border-line bg-white p-0.5 lg:hidden">
          {(["chat", "plan"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={cn("rounded-[6px] px-3 py-1.5 text-sm", tab === t ? "bg-navy font-semibold text-white" : "text-ink")}
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
          className={cn("h-[calc(100dvh-17.5rem)] min-h-[26rem] lg:h-[calc(100dvh-11rem)]", tab === "chat" ? "flex" : "hidden lg:flex")}
        />

        <aside className={cn("space-y-4", tab === "plan" ? "block" : "hidden lg:block")}>
          <section className="rounded-lg border border-line bg-white p-4">
            <h2 className="text-sm font-semibold">The plan</h2>
            {plan ? (
              <>
                <p className="mt-1 text-sm text-muted-foreground">
                  Losing about <Money amount={plan.totalMonthly} tone="ink" className="font-semibold" /> a month. Biggest leak first.
                </p>
                <ol className="mt-3 divide-y divide-line">
                  {plan.steps.map((s) => (
                    <li key={s.id} className="py-3 first:pt-0 last:pb-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="min-w-0 truncate text-sm font-semibold">
                          <span className="num mr-1.5 text-muted-foreground">{s.rank}</span>
                          {s.title}
                        </p>
                        <StatusBadge status={s.status} />
                      </div>
                      <div className="mt-1 flex items-center justify-between gap-2 text-sm">
                        <Money amount={s.impact} per="/mo" sign="+" className="font-semibold" />
                        <Link href={s.href} className="text-muted-foreground underline underline-offset-2">
                          Open
                        </Link>
                      </div>
                    </li>
                  ))}
                </ol>
              </>
            ) : (
              <>
                <p className="mt-1 text-sm">Nine questions, five minutes, then your consultant has something to work with.</p>
                <Button asChild size="sm" className="mt-3">
                  <Link href="/audit">
                    Start the free audit
                    <ArrowRight aria-hidden="true" />
                  </Link>
                </Button>
              </>
            )}
          </section>

          {working.length ? (
            <section className="rounded-lg border border-line bg-white p-4">
              <h2 className="text-sm font-semibold">In progress</h2>
              <ul className="mt-2 space-y-2">
                {working.map((t) => (
                  <li key={t.id} className="flex items-start gap-2 text-sm">
                    <Clock size={14} className="mt-1 shrink-0 text-muted-foreground" aria-hidden="true" />
                    <div>
                      <p className="font-semibold">{t.title}</p>
                      {typeof t.result.note === "string" ? <p className="text-muted-foreground">{t.result.note}</p> : null}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section className="rounded-lg border border-line bg-white p-4">
            <h2 className="text-sm font-semibold">Hands-on tools</h2>
            <ul className="mt-2 space-y-1 text-sm">
              <li>
                <Link href="/dashboard/text-back" className="underline underline-offset-2">
                  Text-back inbox and settings
                </Link>
              </li>
              <li>
                <Link href="/dashboard/customers" className="underline underline-offset-2">
                  Customers and logged jobs
                </Link>
              </li>
              <li>
                <Link href="/dashboard/settings" className="underline underline-offset-2">
                  Business and account settings
                </Link>
              </li>
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}
