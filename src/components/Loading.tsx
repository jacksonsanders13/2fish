import { Card } from "./ui/card";
import { Skeleton } from "./ui/skeleton";

// Skeleton cards in the shape of a need card, so the page doesn't jump.
export default function Loading({ count = 2 }: { count?: number }) {
  return (
    <div className="grid gap-4" role="status">
      <span className="sr-only">Loading needs…</span>
      {Array.from({ length: count }, (_, i) => (
        <Card key={i} padding="none" className="overflow-hidden">
          <div className="flex items-center gap-3 p-4">
            <Skeleton className="size-11 rounded-full" />
            <div className="grid flex-1 gap-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
          <div className="grid gap-2 px-4 pb-4">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-4 w-full" />
          </div>
          <Skeleton className="h-14 rounded-none" />
          <div className="p-4">
            <Skeleton className="h-11 w-36 rounded-md" />
          </div>
        </Card>
      ))}
    </div>
  );
}
