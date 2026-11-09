import { Skeleton } from "./ui/skeleton";

// Placeholder rows in the shape of a post, so the page doesn't jump.
export default function Loading({ count = 3 }: { count?: number }) {
  return (
    <div role="status">
      <span className="sr-only">Loading needs…</span>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="flex gap-3 border-b border-border px-4 py-4">
          <Skeleton className="size-11 flex-none" />
          <div className="grid flex-1 gap-2">
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-3 w-1/4" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-9 w-28" />
          </div>
        </div>
      ))}
    </div>
  );
}
