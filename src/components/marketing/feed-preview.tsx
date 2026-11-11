import { SearchIcon, SlidersHorizontalIcon } from "lucide-react";
import { NeedCard, type NeedCardData } from "@/components/needs/need-card";
import { cn } from "@/lib/utils";

// Illustrative cards for the landing page only. The real feed reads from the database.
const now = Date.now();
const SAMPLE: NeedCardData[] = [
  {
    id: "a",
    title: "Size 4 diapers for twins",
    description: "Any brand is fine. Two boxes would carry us to the end of the month.",
    category: "baby",
    urgency: "high",
    status: "open",
    fulfillment: "both",
    createdAt: new Date(now - 2 * 3600e3).toISOString(),
    distanceMiles: 1.6,
    poster: { displayName: "Jess", area: "North Raleigh" },
  },
  {
    id: "b",
    title: "Boys' winter coat, 10/12",
    description: "He outgrew last year's. Gently used is perfect.",
    category: "clothing",
    urgency: "normal",
    status: "pledged",
    fulfillment: "in_person",
    createdAt: new Date(now - 26 * 3600e3).toISOString(),
    distanceMiles: 3.2,
    poster: { displayName: "Marcus", area: "Midtown" },
  },
  {
    id: "c",
    title: "Groceries for the week",
    description: "Between paychecks. Rice, beans, peanut butter, anything shelf-stable.",
    category: "food",
    urgency: "normal",
    status: "open",
    fulfillment: "in_person",
    createdAt: new Date(now - 50 * 60e3).toISOString(),
    distanceMiles: 4.8,
    poster: { displayName: "A neighbor", area: "Garner" },
  },
  {
    id: "d",
    title: "3rd grade school supplies",
    description: "Pencils, glue sticks, and a backpack if anyone has a spare.",
    category: "school",
    urgency: "low",
    status: "fulfilled",
    fulfillment: "wishlist",
    createdAt: new Date(now - 4 * 86400e3).toISOString(),
    distanceMiles: 7.1,
    poster: { displayName: "Ana", area: "Brier Creek" },
  },
];

export function FeedPreview({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "relative overflow-hidden rounded-2xl border bg-background/80 shadow-lift backdrop-blur-sm",
        className,
      )}
    >
      {/* fake app chrome */}
      <div className="flex items-center gap-3 border-b bg-card px-4 py-2.5">
        <div className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-border" />
          <span className="size-2.5 rounded-full bg-border" />
          <span className="size-2.5 rounded-full bg-border" />
        </div>
        <div className="mx-auto flex h-7 w-full max-w-xs items-center gap-2 rounded-md border bg-background px-2.5 text-xs text-muted-foreground">
          <SearchIcon className="size-3.5" />
          Search needs near 27615
        </div>
        <span className="inline-flex size-7 items-center justify-center rounded-md border text-muted-foreground">
          <SlidersHorizontalIcon className="size-3.5" />
        </span>
      </div>
      <div className="flex gap-2 overflow-hidden border-b bg-card/60 px-4 py-2.5">
        {["Within 10 mi", "All categories", "Open", "Urgent first"].map((f, i) => (
          <span
            key={f}
            className={cn(
              "shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-medium",
              i === 0 ? "border-foreground bg-foreground text-background" : "bg-background text-muted-foreground",
            )}
          >
            {f}
          </span>
        ))}
      </div>
      <div className="grid gap-3 p-4 sm:grid-cols-2">
        {SAMPLE.map((n) => (
          <NeedCard key={n.id} need={n} interactive={false} className="shadow-none" />
        ))}
      </div>
    </div>
  );
}
