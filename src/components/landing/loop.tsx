import { Check, Play } from "lucide-react";
import { AnimatedMoney } from "@/components/motion/animated-money";
import { GrowBar } from "@/components/motion/grow-bar";
import { Money } from "@/components/ui/money";
import { money } from "@/lib/format";
import { plan, recovered, videos } from "@/lib/data";
import { cn } from "@/lib/utils";

// Grade, post, approve, prove: the loop shown in the "how" section of the landing page.
export const loop = [
  {
    n: 1,
    name: "Grade",
    title: "Your store, scored in about 2 minutes",
    body: "Enter your store name and Instagram handle. You get a score out of 100 and three fixes, like \"You posted 3 times in October.\"",
  },
  {
    n: 2,
    name: "Fix",
    title: "The fixes, biggest first",
    body: "Each fix shows what it could bring in a month. The one worth the most comes first. No 40-page report.",
  },
  {
    n: 3,
    name: "Post",
    title: "7 posts a week from your own photos, on the day you pick",
    body: "Send new-arrival photos and try-on clips. 2fish writes the captions and turns them into a week of posts. You approve the week in one tap.",
  },
  {
    n: 4,
    name: "Prove",
    title: "What the posts sold, counted in dollars",
    body: "2fish reads your Square sales and matches them to your posts. When the green dress sells 6 the week it's posted, up from 2, you see it in dollars, not likes.",
  },
] as const;

// Each snippet is a tiny piece of the product. Only the progress bars and the
// dollar figure move, once, when they scroll into view.
export function StepSnippet({ n, className }: { n: 1 | 2 | 3 | 4; className?: string }) {
  const frame = cn("min-w-0 rounded-lg bg-surface p-4 text-sm", className);

  if (n === 1) {
    const options = ["Most days", "About once a week", "A few times a month"];
    return (
      <div className={frame} aria-hidden="true">
        <div className="flex items-center justify-between">
          <span className="font-semibold">Question 3 of 6</span>
          <span className="num text-muted-foreground">50%</span>
        </div>
        <GrowBar pct={50} delay={0.3} duration={0.7} className="mt-2 h-1" />
        <p className="mt-4 font-semibold">How often do you post on Instagram?</p>
        <ul className="mt-3 space-y-2">
          {options.map((o, i) => (
            <li
              key={o}
              className={cn(
                "flex items-center justify-between rounded-md border px-3 py-2",
                i === 0 ? "border-night bg-night text-white" : "border-line bg-white",
              )}
            >
              {o}
              {i === 0 ? <Check size={14} /> : null}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (n === 2) {
    return (
      <div className={frame} aria-hidden="true">
        <div className="flex items-center justify-between">
          <span className="font-semibold">Your fixes</span>
          <span className="text-muted-foreground">Biggest first</span>
        </div>
        <ol className="mt-2">
          {plan.slice(0, 3).map((s) => (
            <li key={s.rank} className="flex items-start gap-3 py-2.5">
              <span className="num shrink-0 text-muted-foreground">{s.rank}</span>
              <span className="min-w-0 flex-1 font-medium">{s.title}</span>
              <Money amount={s.impact} per="/mo" sign="+" className="shrink-0 font-semibold" />
            </li>
          ))}
        </ol>
      </div>
    );
  }

  if (n === 3) {
    const tones = { night: "bg-night text-white", surface: "bg-white text-ink" };
    return (
      <div className={frame} aria-hidden="true">
        <div className="flex items-center justify-between gap-3">
          <span className="font-semibold">7 posts ready from this week&apos;s photos</span>
          <span className="shrink-0 rounded-md bg-night px-2.5 py-1 font-medium text-white">Approve all</span>
        </div>
        <ul className="mt-3 grid grid-cols-3 gap-2">
          {videos.slice(0, 3).map((v) => (
            <li
              key={v.id}
              className={cn("relative flex aspect-[4/5] items-center justify-center rounded-md", tones[v.tone])}
            >
              <Play size={18} />
              <span className="num absolute right-1.5 bottom-1.5">{v.length}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  const pct = Math.round((recovered.amount / recovered.pace) * 100);
  return (
    <div className={frame} aria-hidden="true">
      <p className="font-semibold">Tracked sales this month</p>
      <p className="mt-1 text-display font-semibold">
        <AnimatedMoney amount={recovered.amount} duration={1.4} delay={0.2} />
      </p>
      <p className="mt-2 text-muted-foreground">
        {recovered.sales} shoppers from posts, {recovered.period}
      </p>
      <GrowBar pct={pct} delay={0.4} duration={1} className="mt-3 h-1.5" barClassName="bg-cash" />
      <p className="num mt-2 text-muted-foreground">On pace for about {money(recovered.pace)}</p>
    </div>
  );
}
