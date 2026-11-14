import { Skeleton } from "@/components/ui/skeleton";
import { FeedSkeleton } from "@/components/needs/need-card-skeleton";
import { Container } from "@/components/layout/container";

export default function Loading() {
  return (
    <Container className="py-8 sm:py-10">
      <Skeleton className="h-9 w-56" />
      <Skeleton className="mt-3 h-4 w-80" />
      <div className="mt-8 grid gap-8 lg:grid-cols-[240px_1fr]">
        <div className="hidden space-y-3 lg:block">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
        <FeedSkeleton />
      </div>
    </Container>
  );
}
