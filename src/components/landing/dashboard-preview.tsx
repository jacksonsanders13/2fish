import { Logo } from "@/components/brand/logo";
import { Money } from "@/components/ui/money";
import { StatusPill } from "@/components/ui/pill";
import { activity, business, plan, recovered } from "@/lib/data";
import { cn } from "@/lib/utils";

// A small, real-looking render of the dashboard. This is the hero image on
// both landing pages. Same data as the real dashboard screen.
export function DashboardPreview({ chrome = "light", className }: { chrome?: "light" | "navy"; className?: string }) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-card border border-line bg-white text-left text-ink shadow-raised",
        className,
      )}
    >
      <h3 className="sr-only">Sample dashboard for {business.name}</h3>
      <div
        className={cn(
          "flex items-center justify-between gap-3 border-b px-4 py-2.5 text-xs",
          chrome === "navy" ? "border-on-navy-line bg-navy text-white" : "border-line bg-white",
        )}
      >
        <Logo size={16} />
        <span className={cn("truncate", chrome === "navy" ? "text-on-navy-muted" : "text-muted")}>
          {business.name}
        </span>
        <span className={cn("hidden sm:inline", chrome === "navy" ? "text-on-navy-muted" : "text-muted")}>
          November
        </span>
      </div>
      <div className="grid sm:grid-cols-[1.4fr_1fr]">
        <div className="min-w-0 border-b border-line p-4 sm:border-r sm:border-b-0 sm:p-5">
          <p className="text-xs text-muted">Recovered this month</p>
          <p className="mt-1 font-display text-4xl leading-none tracking-tight sm:text-5xl">
            <Money amount={recovered.amount} />
          </p>
          <p className="mt-2 text-xs text-muted">
            {recovered.jobs} jobs traced to your plan, {recovered.period}
          </p>
          <ol className="mt-4 divide-y divide-line border-t border-line text-xs">
            {plan.slice(0, 4).map((step) => (
              <li key={step.rank} className="flex items-center gap-3 py-2">
                <span className="num w-4 text-muted">{step.rank}</span>
                <span className="min-w-0 flex-1 truncate font-medium">{step.title}</span>
                <StatusPill status={step.status} className="hidden sm:inline-flex" />
                <Money amount={step.impact} per="/mo" className="font-semibold" />
              </li>
            ))}
          </ol>
        </div>
        <div className="min-w-0 p-4 sm:p-5">
          <p className="text-xs font-medium">Today</p>
          <ul className="mt-2 space-y-2.5 text-xs">
            {activity.slice(0, 4).map((a) => (
              <li key={a.text} className="flex gap-2">
                <span className="num w-16 shrink-0 whitespace-nowrap text-muted">{a.when}</span>
                <span className="text-ink">{a.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
