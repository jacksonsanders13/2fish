import { Logo } from "@/components/brand/logo";
import { AnimatedMoney } from "@/components/motion/animated-money";
import { Money } from "@/components/ui/money";
import { activity, business, plan, recovered } from "@/lib/data";
import { cn } from "@/lib/utils";

// A small, real-looking render of the dashboard, used as the landing page's hero image.
// Only the dollar figure moves: it counts up once. Step names wrap rather than get cut off.
export function DashboardPreview({ chrome = "light", className }: { chrome?: "light" | "night"; className?: string }) {
  return (
    <div className={cn("overflow-hidden rounded-lg bg-white text-left text-sm text-ink", className)}>
      <h3 className="sr-only">Sample dashboard for {business.name}</h3>
      <div
        className={cn(
          "flex items-center justify-between gap-3 border-b px-4 py-2.5",
          chrome === "night" ? "border-on-night-line bg-night text-white" : "border-line bg-white",
        )}
      >
        <Logo size={16} />
        <span className="truncate">{business.name}</span>
        <span className="hidden sm:inline">November</span>
      </div>
      <div className="grid sm:grid-cols-[1.4fr_1fr]">
        <div className="min-w-0 border-b border-line p-4 sm:border-r sm:border-b-0 sm:p-5">
          <p className="font-semibold">Recovered this month</p>
          <p className="mt-1 text-display font-semibold">
            <AnimatedMoney amount={recovered.amount} duration={1.6} delay={0.3} />
          </p>
          <p className="mt-2 text-muted-foreground">
            {recovered.jobs} jobs traced to your plan, {recovered.period}
          </p>
          <ol className="mt-4">
            {plan.slice(0, 4).map((step) => (
              <li key={step.rank} className="flex items-start gap-3 py-2">
                <span className="num w-4 shrink-0 text-muted-foreground">{step.rank}</span>
                <span className="min-w-0 flex-1 font-medium">{step.title}</span>
                <Money amount={step.impact} per="/mo" className="shrink-0 font-semibold" />
              </li>
            ))}
          </ol>
        </div>
        <div className="min-w-0 p-4 sm:p-5">
          <p className="font-semibold">Today</p>
          <ul className="mt-2 space-y-2.5">
            {activity.slice(0, 4).map((a) => (
              <li key={a.text} className="flex gap-2">
                <span className="num w-16 shrink-0 whitespace-nowrap text-muted-foreground">{a.when}</span>
                <span>{a.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
