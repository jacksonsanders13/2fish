import { Check, Play } from "lucide-react";
import { AnimatedMoney } from "@/components/motion/animated-money";
import { GrowBar } from "@/components/motion/grow-bar";
import { Reveal } from "@/components/motion/reveal";
import { Money } from "@/components/ui/money";
import { StatusBadge } from "@/components/ui/status-badge";
import { money } from "@/lib/format";
import { plan, recovered, videos } from "@/lib/data";
import { cn } from "@/lib/utils";

// The audit → plan → do → track loop. Copy lives here so both landing
// pages say the same thing even though they lay it out differently.
export const loop = [
  {
    n: 1,
    name: "Audit",
    title: "Nine questions. Five minutes.",
    body: "How many calls you get, what happens when you miss one, what a job is worth, how many reviews you have. Nothing you don't already know off the top of your head.",
  },
  {
    n: 2,
    name: "Plan",
    title: "Your leaks, ranked by dollars.",
    body: "Say you're losing $7,060 a month and missed calls are the biggest leak. That step comes first. No 40-page report.",
  },
  {
    n: 3,
    name: "Do",
    title: "2fish does the step. You approve.",
    body: "Turn on missed-call text-back. Upload five phone clips and get seven captioned videos. Review requests go out the morning after each job.",
  },
  {
    n: 4,
    name: "Track",
    title: "Watch the number go up.",
    body: "Every job that came from a step gets counted, in dollars. Six jobs from text-backs show up as $2,310, not as likes.",
  },
] as const;

// Each snippet is a tiny live piece of the product. They animate internally
// when they scroll into view.
export function StepSnippet({ n, className }: { n: 1 | 2 | 3 | 4; className?: string }) {
  const frame = cn("min-w-0 rounded-lg border border-line bg-white p-4 text-sm", className);

  if (n === 1) {
    const options = ["It goes to voicemail", "Nothing, it just rings", "Someone else answers"];
    return (
      <div className={frame} aria-hidden="true">
        <div className="flex items-center justify-between">
          <span className="font-semibold">Question 3 of 9</span>
          <span className="num text-muted-foreground">33%</span>
        </div>
        <GrowBar pct={33} delay={0.3} duration={0.7} className="mt-2 h-1" />
        <p className="mt-4 font-semibold">When you can&apos;t pick up, what happens?</p>
        <ul className="mt-3 space-y-2">
          {options.map((o, i) => (
            <Reveal
              as="li"
              key={o}
              delay={0.4 + i * 0.12}
              y={10}
              className={cn(
                "flex items-center justify-between rounded-md border px-3 py-2",
                i === 0 ? "border-night bg-night text-white" : "border-line",
              )}
            >
              {o}
              {i === 0 ? (
                <Reveal as="span" delay={0.9} y={0} duration={0.3} className="inline-flex">
                  <Check size={14} />
                </Reveal>
              ) : null}
            </Reveal>
          ))}
        </ul>
      </div>
    );
  }

  if (n === 2) {
    return (
      <div className={frame} aria-hidden="true">
        <div className="flex items-center justify-between">
          <span className="font-semibold">Your plan</span>
          <span className="text-muted-foreground">Biggest leak first</span>
        </div>
        <ol className="mt-2 divide-y divide-line">
          {plan.slice(0, 3).map((s, i) => (
            <Reveal as="li" key={s.rank} delay={0.3 + i * 0.14} y={10} className="flex items-center gap-3 py-2.5">
              <span className="num text-muted-foreground">{s.rank}</span>
              <span className="min-w-0 flex-1 truncate font-medium">{s.title}</span>
              <StatusBadge status={s.status} className="hidden xl:inline-flex" />
              <Money amount={s.impact} per="/mo" sign="+" className="font-semibold" />
            </Reveal>
          ))}
        </ol>
      </div>
    );
  }

  if (n === 3) {
    const tones = { night: "bg-night text-white", surface: "bg-surface text-ink" };
    return (
      <div className={frame} aria-hidden="true">
        <div className="flex items-center justify-between gap-3">
          <span className="font-semibold">7 videos ready from Tuesday&apos;s clips</span>
          <Reveal as="span" delay={0.8} y={0} duration={0.4} className="shrink-0 rounded-md bg-night px-2.5 py-1 font-medium text-white">
            Approve all
          </Reveal>
        </div>
        <ul className="mt-3 grid grid-cols-3 gap-2">
          {videos.slice(0, 3).map((v, i) => (
            <Reveal
              as="li"
              key={v.id}
              delay={0.3 + i * 0.14}
              y={14}
              className={cn("relative flex aspect-[4/5] items-center justify-center rounded-md", tones[v.tone])}
            >
              <Play size={18} />
              <span className="num absolute right-1.5 bottom-1.5 opacity-80">{v.length}</span>
            </Reveal>
          ))}
        </ul>
      </div>
    );
  }

  const pct = Math.round((recovered.amount / recovered.pace) * 100);
  return (
    <div className={frame} aria-hidden="true">
      <p className="font-semibold">Recovered this month</p>
      <p className="mt-1 text-display font-semibold">
        <AnimatedMoney amount={recovered.amount} duration={1.4} delay={0.2} />
      </p>
      <p className="mt-2 text-muted-foreground">
        {recovered.jobs} jobs, {recovered.period}
      </p>
      <GrowBar pct={pct} delay={0.4} duration={1} className="mt-3 h-1.5" barClassName="bg-cash" />
      <p className="num mt-2 text-muted-foreground">On pace for about {money(recovered.pace)}</p>
    </div>
  );
}

export const features = [
  {
    title: "Missed-call text-back",
    body: "A text goes out 10 seconds after a call you couldn't take. The reply lands on your phone.",
    when: "In the first release",
  },
  {
    title: "Review requests",
    body: "The morning after a job, the customer gets a text with your Google link. One tap for them.",
    when: "In the first release",
  },
  {
    title: "Videos from your clips",
    body: "Five phone clips in. Seven captioned vertical videos out, scheduled for the week.",
    when: "In the first release",
  },
  {
    title: "Past-customer reminders",
    body: "A short text to everyone you served last year when it's time for the next wash.",
    when: "Coming after launch",
  },
];
