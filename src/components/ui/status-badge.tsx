import { Badge } from "@/components/ui/badge";
import type { StepStatus } from "@/lib/data";
import { cn } from "@/lib/utils";

// Green is reserved for dollar figures, so status is navy, outline, or neutral.
const styles: Record<StepStatus, { label: string; cls: string }> = {
  live: { label: "Live", cls: "border-navy bg-navy text-white" },
  "in-progress": { label: "In progress", cls: "border-navy bg-white text-navy" },
  "needs-you": { label: "Needs you", cls: "border-line bg-surface text-ink" },
  done: { label: "Done", cls: "border-line bg-white text-muted-foreground" },
  "not-started": { label: "Not started", cls: "border-line bg-white text-muted-foreground" },
};

export function StatusBadge({ status, className }: { status: StepStatus; className?: string }) {
  const s = styles[status];
  return (
    <Badge variant="outline" className={cn("rounded-full px-2.5 py-0.5 text-sm font-medium", s.cls, className)}>
      {s.label}
    </Badge>
  );
}
