import { cn } from "@/lib/utils";

// A simple bar filled to pct. It used to grow in with JavaScript, which left it
// empty on slow phones until the page loaded, so now it's just drawn full.
// delay and duration are still accepted so old callers don't break.
export function GrowBar({
  pct,
  className,
  barClassName,
}: {
  pct: number;
  delay?: number;
  duration?: number;
  className?: string;
  barClassName?: string;
}) {
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-line", className)} aria-hidden="true">
      <div className={cn("h-full rounded-full bg-night", barClassName)} style={{ width: `${pct}%` }} />
    </div>
  );
}
