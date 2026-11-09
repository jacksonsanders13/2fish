import { cn } from "@/lib/utils";

// Placeholder block shown while needs load.
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn("animate-glow rounded-full bg-muted", className)} />;
}
