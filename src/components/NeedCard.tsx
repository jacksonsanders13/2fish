"use client";

import { useState } from "react";
import { Clock, ExternalLink, Gift, HeartHandshake, MapPin } from "lucide-react";
import Logo from "./Logo";
import { useBoard } from "./BoardProvider";
import { Avatar } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Button, buttonVariants } from "./ui/button";
import { Card } from "./ui/card";
import { Notice } from "./ui/notice";
import { StatusProgress } from "./ui/progress";
import { Heading, Text } from "./ui/typography";
import { CATEGORY_TONE } from "@/lib/categories";
import { daysUntil, dueLabel, safeUrl, timeAgo } from "@/lib/format";
import type { Need } from "@/lib/types";

const STATUS_LABEL = { open: "Open", pledged: "Being helped", done: "Received" } as const;

export default function NeedCard({ need: n }: { need: Need }) {
  const board = useBoard();
  const mine = n.posterId === board.me;
  const helping = n.helper?.id === board.me;
  const wishlist = safeUrl(n.wishlistUrl);
  const due = daysUntil(n.neededBy);
  const urgent = due !== null && due <= 1 && n.status === "open";
  const where = [n.area, n.zip].filter(Boolean).join(" · ");

  return (
    <Card as="article" variant="interactive" padding="none" className="grid content-start" aria-labelledby={`need-${n.id}`}>
      {/* who posted it */}
      <header className="flex items-center gap-3 px-4 pb-2 pt-4">
        <Avatar name={n.displayName || "Neighbor"} seed={n.posterId} />
        <div className="min-w-0 flex-1">
          <p className="m-0 flex flex-wrap items-center gap-2 font-extrabold">
            {n.displayName || "A neighbor"}
            {n.example && <Badge variant="example">Example</Badge>}
          </p>
          <Text variant="meta">
            {where} · <time dateTime={new Date(n.createdAt).toISOString()}>{timeAgo(n.createdAt)}</time>
          </Text>
        </div>
        <Badge variant={n.status}>{STATUS_LABEL[n.status]}</Badge>
      </header>

      <div className="grid gap-2 px-4 pb-4">
        <Heading as="h3" level="card" id={`need-${n.id}`}>
          {n.title}
        </Heading>
        {n.story && <p className="m-0 max-w-prose">{n.story}</p>}
      </div>

      {/* colored category band */}
      <div className={`flex items-center justify-between gap-2 px-4 py-3 font-extrabold text-on-color ${CATEGORY_TONE[n.category]}`}>
        <div className="flex items-center gap-2">
          <Logo size={32} tone="inherit" />
          <span className="text-sm uppercase tracking-widest">{n.category}</span>
        </div>
        {n.neededBy && n.status !== "done" && (
          <Badge variant={urgent ? "urgent" : "due"} size="md">
            <Clock aria-hidden="true" />
            {dueLabel(n.neededBy)}
          </Badge>
        )}
      </div>

      <div className="px-4 pt-4">
        <StatusProgress status={n.status} />
      </div>

      {(n.inPerson || wishlist) && (
        <div className="flex flex-wrap gap-2 px-4 pt-4">
          {n.inPerson && <Badge size="md">
              <MapPin aria-hidden="true" />
              Drop off: {n.meetSpot || "public spot"}
            </Badge>}
          {wishlist && (
            <Badge size="md">
              <Gift aria-hidden="true" />
              Wishlist
            </Badge>
          )}
        </div>
      )}

      {n.helper && n.status !== "open" && n.helper.note && (
        <Notice variant="success" className="mx-4 mt-4">
          <b>Helper:</b> {n.helper.note}
        </Notice>
      )}

      <Actions need={n} mine={mine} helping={helping} wishlist={wishlist} />
    </Card>
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
      <Button key="help" variant="help" grow onClick={() => openHelp(n)}>
        <HeartHandshake aria-hidden="true" />
        I&apos;ll help
      </Button>,
    );
  }
  if (wishlist && n.status !== "done") {
    buttons.push(
      <a key="wish" className={buttonVariants({ variant: "outline" })} href={wishlist} target="_blank" rel="noopener noreferrer">
        View wishlist
        <ExternalLink aria-hidden="true" />
        <span className="sr-only"> (opens in a new tab)</span>
      </a>,
    );
  }
  if (helping && n.status === "pledged") {
    buttons.push(
      <Button
        key="cancel"
        variant="secondary"
        disabled={busy}
        onClick={() => run(() => cancelPledge(n.id), "Offer cancelled. The post is open again.")}
      >
        Cancel my offer
      </Button>,
    );
  }
  if (mine && n.status === "pledged") {
    buttons.push(
      <Button
        key="got"
        variant="help"
        grow
        disabled={busy}
        onClick={() => run(() => markReceived(n.id), "Marked received. So glad it came through.")}
      >
        I got it, thank you
      </Button>,
    );
  }
  if (mine && n.status === "open") {
    buttons.push(
      <Button
        key="remove"
        variant="secondary"
        disabled={busy}
        onClick={() => run(() => removeNeed(n.id), "Post removed.")}
      >
        Remove post
      </Button>,
    );
  }
  if (mine && n.status === "open" && !live) {
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

  if (!buttons.length) return <div className="pb-4" />;
  return <footer className="flex flex-wrap items-center gap-2 p-4">{buttons}</footer>;
}
