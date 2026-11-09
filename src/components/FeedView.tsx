"use client";

import Link from "next/link";
import CategoryStories from "./CategoryStories";
import NeedList from "./NeedList";
import Loading from "./Loading";
import LoadError from "./LoadError";
import { LocationControls, useNearby } from "./AreaWidgets";
import { useBoard } from "./BoardProvider";
import { Avatar } from "./ui/avatar";
import { buttonVariants } from "./ui/button";
import { inputVariants } from "./ui/input";
import { Heading, Text } from "./ui/typography";
import { zipOk } from "@/lib/format";

const ORDER = { open: 0, pledged: 1, done: 2 };

export default function FeedView() {
  const b = useBoard();
  const nearby = useNearby();

  const query = b.q.trim().toLowerCase();
  const matches = (n: (typeof nearby)[number]) =>
    !query || [n.title, n.story, n.area, n.category].join(" ").toLowerCase().includes(query);
  const shown = nearby
    .filter((n) => matches(n) && (b.cat === "All" || n.category === b.cat))
    .sort((x, y) => ORDER[x.status] - ORDER[y.status] || y.createdAt - x.createdAt);

  const emptyText = query
    ? "No needs match your search."
    : zipOk(b.zip) && b.range !== "all"
      ? "No needs near you yet. Try Anywhere, or post the first one."
      : "No needs posted yet. Be the first.";

  return (
    <>
      <Heading as="h1" level="page" className="sr-only">
        Needs near you
      </Heading>

      {/* "What do you need help with?" like a status composer */}
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        <Avatar name={b.displayName || "You"} tone="brand" />
        <Link href="/post" onClick={() => b.setDraftCategory(null)} className={inputVariants({ tone: "pill", size: "md" })}>
          What do you need help with?
        </Link>
      </div>

      {/* on wide screens these live in the right-hand rail */}
      <div className="border-b border-border px-4 py-3 xl:hidden">
        <LocationControls idPrefix="feed" />
      </div>

      <div className="border-b border-border">
        <CategoryStories />
      </div>

      {query && (
        <div className="border-b border-border px-4 py-3">
          <Text variant="meta">
            {shown.length} {shown.length === 1 ? "result" : "results"} for “{b.q.trim()}”
          </Text>
        </div>
      )}

      {!b.ready ? (
        <Loading />
      ) : b.loadError ? (
        <div className="p-4">
          <LoadError message={b.loadError} onRetry={b.reload} />
        </div>
      ) : (
        <NeedList
          needs={shown}
          empty={emptyText}
          emptyAction={
            <Link href="/post" className={buttonVariants({ variant: "primary" })}>
              Post a need
            </Link>
          }
        />
      )}
    </>
  );
}
