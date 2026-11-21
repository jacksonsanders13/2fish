import { Badge } from "@/components/ui/badge";
import type { StepStatus } from "@/lib/data";
import { cn } from "@/lib/utils";

// Green is reserved for dollar figures. Coral marks the one status the owner has to act on.
const styles: Record<StepStatus, { label: string; cls: string }> = {
  live: { label: "Live", cls: "border-night bg-night text-white" },
  "in-progress": { label: "In progress", cls: "border-night bg-white text-night" },
  "needs-you": { label: "Needs you", cls: "border-signal bg-white text-signal" },
  done: { label: "Done", cls: "border-line bg-white text-muted-foreground" },
  "not-started": { label: "Not started", cls: "border-line bg-white text-muted-foreground" },
};

export function StatusBadge({ status, className }: { status: StepStatus; className?: string }) {
  const s = styles[status];
  return (
    <Badge variant="outline" className={cn("rounded-full px-2.5 py-0.5 text-sm font-normal", s.cls, className)}>
      {status === "live" ? (
        <span className="relative mr-0.5 flex size-1.5" aria-hidden="true">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-white opacity-70 motion-reduce:animate-none" />
          <span className="relative inline-flex size-1.5 rounded-full bg-white" />
        </span>
      ) : null}
      {s.label}
    </Badge>
  );
}
