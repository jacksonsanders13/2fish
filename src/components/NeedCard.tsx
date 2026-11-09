"use client";

import { useState } from "react";
import { CircleCheck, Clock, ExternalLink, Gift, HeartHandshake, MapPin } from "lucide-react";
import { CategoryTag } from "./category";
import { useBoard } from "./BoardProvider";
import { Avatar } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Button, buttonVariants } from "./ui/button";
import { Heading, Text } from "./ui/typography";
import { daysUntil, dueLabel, safeUrl, timeAgo } from "@/lib/format";
import type { Need } from "@/lib/types";

// One post in the feed: a row, not a box. Avatar on the left, everything
// else stacked beside it, like a social feed.
export default function NeedCard({ need: n }: { need: Need }) {
  const board = useBoard();
  const mine = n.posterId === board.me;
  const helping = n.helper?.id === board.me;
  const wishlist = safeUrl(n.wishlistUrl);
  const due = daysUntil(n.neededBy);
  const urgent = due !== null && due <= 1 && n.status === "open";
  const name = n.displayName || "A neighbor";
  const where = [n.area, n.zip].filter(Boolean).join(", ");

  return (
    <article
      className="flex gap-3 border-b border-border px-4 py-4 transition-colors duration-200 ease-smooth animate-fade-in-up stagger hover:bg-muted/50"
      aria-labelledby={`need-${n.id}`}
    >
      <Avatar name={n.displayName || "Neighbor"} seed={n.posterId} />

      <div className="grid min-w-0 flex-1 gap-2">
        {/* name · place · time */}
        <header className="flex flex-wrap items-center gap-x-1.5 gap-y-1 leading-tight">
          <b className="font-bold">{mine ? "You" : name}</b>
          {n.example && <Badge variant="example">Example</Badge>}
          <Text as="span" variant="meta">
            · {where} · <time dateTime={new Date(n.createdAt).toISOString()}>{timeAgo(n.createdAt)}</time>
          </Text>
        </header>

        <div className="flex flex-wrap items-center gap-2">
          <CategoryTag category={n.category} />
          {n.neededBy && n.status !== "done" && (
            <Badge variant={urgent ? "urgent" : "due"}>
              <Clock aria-hidden="true" />
              {dueLabel(n.neededBy)}
            </Badge>
          )}
        </div>

        <Heading as="h3" level="card" id={`need-${n.id}`}>
          {n.title}
        </Heading>
        {n.story && <Text className="max-w-prose">{n.story}</Text>}

        {(n.inPerson || wishlist) && (
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {n.inPerson && (
              <Badge variant="tag" size="md">
                <MapPin aria-hidden="true" />
                {n.meetSpot || "Public spot"}
              </Badge>
            )}
            {wishlist && (
              <Badge variant="tag" size="md">
                <Gift aria-hidden="true" />
                Wishlist
              </Badge>
            )}
          </div>
        )}

        <StatusLine need={n} helping={helping} />
        <Actions need={n} mine={mine} helping={helping} wishlist={wishlist} />
      </div>
    </article>
  );
}

// What's happened so far, in words instead of a progress bar.
function StatusLine({ need: n, helping }: { need: Need; helping: boolean }) {
  if (n.status === "open") return null;
  const done = n.status === "done";
  const who = helping ? "You're" : "A neighbor is";
  return (
    <div className={`flex items-start gap-2 rounded-md px-3 py-2 text-sm ${done ? "bg-success-soft" : "bg-accent-soft"}`}>
      {done ? (
        <CircleCheck aria-hidden="true" className="mt-0.5 size-4 flex-none text-success-soft-foreground" />
      ) : (
        <HeartHandshake aria-hidden="true" className="mt-0.5 size-4 flex-none text-accent-soft-foreground" />
      )}
      <span>
        <b className={done ? "text-success-soft-foreground" : "text-accent-soft-foreground"}>
          {done ? "Received. Thank you, neighbor." : `${who} helping with this.`}
        </b>
        {!done && n.helper?.note && <> “{n.helper.note}”</>}
      </span>
    </div>
  );
}

function Actions({ need: n, mine, helping, wishlist }: { need: Need; mine: boolean; helping: boolean; wishlist: string | null }) {
  const { live, openHelp, cancelPledge, markReceived, removeNeed, fakeNeighborHelps, toast } = useBoard();
  const [busy, setBusy] = useState(false);
  const buttons: React.ReactNode[] = [];

  // runs a board action, keeps buttons disabled meanwhile, toasts on success
  const run = async (action: () => Promise<boolean>, done: string) => {
    setBusy(true);
    const ok = await action();
    setBusy(false);
    if (ok) toast(done);
  };

  if (!mine && n.status === "open") {
    buttons.push(
      <Button key="help" variant="primary" size="sm" onClick={() => openHelp(n)}>
        <HeartHandshake aria-hidden="true" />
        I&apos;ll help
      </Button>,
    );
  }
  if (mine && n.status === "pledged") {
    buttons.push(
      <Button key="got" variant="primary" size="sm" disabled={busy} onClick={() => run(() => markReceived(n.id), "Marked received. So glad it came through.")}>
        <CircleCheck aria-hidden="true" />
        I got it, thank you
      </Button>,
    );
  }
  if (wishlist && n.status !== "done") {
    buttons.push(
      <a key="wish" className={buttonVariants({ variant: "ghost", size: "sm" })} href={wishlist} target="_blank" rel="noopener noreferrer">
        View wishlist
        <ExternalLink aria-hidden="true" />
        <span className="sr-only"> (opens in a new tab)</span>
      </a>,
    );
  }
  if (helping && n.status === "pledged") {
    buttons.push(
      <Button key="cancel" variant="ghost" size="sm" disabled={busy} onClick={() => run(() => cancelPledge(n.id), "Offer cancelled. The post is open again.")}>
        Cancel my offer
      </Button>,
    );
  }
  if (mine && n.status === "open") {
    buttons.push(
      <Button key="remove" variant="ghost" size="sm" disabled={busy} onClick={() => run(() => removeNeed(n.id), "Post removed.")}>
        Remove post
      </Button>,
    );
    if (!live) {
      buttons.push(
        // preview mode only: lets you try "I got it" on your own post
        <Button
          key="fake"
          variant="dev"
          size="sm"
          onClick={() => {
            fakeNeighborHelps(n.id);
            toast("Test mode: a pretend neighbor offered to help.");
          }}
        >
          Test: pretend a neighbor helps
        </Button>,
      );
    }
  }

  if (!buttons.length) return null;
  return <footer className="-ml-1 flex flex-wrap items-center gap-2 pt-1">{buttons}</footer>;
}
