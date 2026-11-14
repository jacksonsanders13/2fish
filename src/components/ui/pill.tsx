import type { StepStatus } from "@/lib/data";
import { cn } from "@/lib/utils";

const styles: Record<StepStatus, { label: string; cls: string; dot: string }> = {
  live: { label: "Live", cls: "bg-cash/10 text-cash", dot: "bg-cash" },
  "in-progress": { label: "In progress", cls: "bg-navy/8 text-navy", dot: "bg-navy" },
  "needs-you": { label: "Needs you", cls: "bg-sand text-navy", dot: "bg-navy" },
  done: { label: "Done", cls: "bg-surface text-muted", dot: "bg-muted" },
  "not-started": { label: "Not started", cls: "bg-surface text-muted", dot: "border border-muted" },
};

export function StatusPill({ status, className }: { status: StepStatus; className?: string }) {
  const s = styles[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium",
        s.cls,
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", s.dot)} aria-hidden="true" />
      {s.label}
    </span>
  );
}
