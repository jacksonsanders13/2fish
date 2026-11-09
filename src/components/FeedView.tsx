"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { cva } from "class-variance-authority";
import Logo from "./Logo";
import NeedList from "./NeedList";
import Tabs from "./Tabs";
import Loading from "./Loading";
import LoadError from "./LoadError";
import { useBoard } from "./BoardProvider";
import { Avatar } from "./ui/avatar";
import { Button, buttonVariants } from "./ui/button";
import { Card } from "./ui/card";
import { Chip } from "./ui/chip";
import { Input, Label, inputVariants } from "./ui/input";
import { Notice } from "./ui/notice";
import { CATEGORIES, type Category } from "@/lib/categories";
import { digitsOnly, zipOk } from "@/lib/format";
import type { Need, Range } from "@/lib/types";

const QUICK: { cat: Category; label: string }[] = [
  { cat: "Baby", label: "Baby items" },
  { cat: "Food", label: "Groceries" },
  { cat: "Clothing", label: "Clothing" },
];

const RANGES: { value: Range; label: string }[] = [
  { value: "zip", label: "My ZIP" },
  { value: "area", label: "Nearby" },
  { value: "all", label: "Anywhere" },
];

const ORDER = { open: 0, pledged: 1, done: 2 };

export default function FeedView() {
  const b = useBoard();
  const router = useRouter();

  // Nearby = same first 3 digits of the ZIP. Good enough for now.
  const inRange = (n: Need) => {
    if (b.range === "all" || !zipOk(b.zip)) return true;
    if (b.range === "zip") return n.zip === b.zip;
    return n.zip.slice(0, 3) === b.zip.slice(0, 3);
  };
  const query = b.q.trim().toLowerCase();
  const matches = (n: Need) => !query || [n.title, n.story, n.area, n.category].join(" ").toLowerCase().includes(query);

  const nearby = b.needs.filter(inRange);
  const shown = nearby
    .filter((n) => matches(n) && (b.cat === "All" || n.category === b.cat))
    .sort((x, y) => ORDER[x.status] - ORDER[y.status] || y.createdAt - x.createdAt);

  const emptyText = query
    ? "No needs match your search."
    : zipOk(b.zip) && b.range !== "all"
      ? "No needs near you yet. Try Anywhere, or post the first one."
      : "No needs posted yet. Be the first.";

  return (
    <div className="grid gap-6 lg:grid-cols-[20rem_minmax(0,1fr)] lg:items-start lg:gap-8">
      <Hero />

      <aside className="grid gap-4 lg:sticky lg:top-24" aria-label="Post and filter">
        {/* "What do you need help with?" */}
        <Card padding="sm" className="hidden gap-2 lg:grid">
          <div className="flex items-center gap-3">
            <Avatar name={b.displayName || "You"} tone="brand" />
            <Link
              href="/post"
              onClick={() => b.setDraftCategory(null)}
              className={inputVariants({ tone: "pill", size: "sm" })}
            >
              What do you need help with?
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-1 border-t border-border pt-2">
            {QUICK.map((qb) => (
              <Button
                key={qb.cat}
                variant="ghost"
                size="sm"
                onClick={() => {
                  b.setDraftCategory(qb.cat);
                  router.push("/post");
                }}
              >
                {qb.label}
              </Button>
            ))}
          </div>
        </Card>

        {/* ZIP + how far */}
        <Card padding="sm" className="grid gap-2">
          <div className="flex items-center gap-3">
            <Label htmlFor="zip">Your ZIP</Label>
            <Input
              id="zip"
              width="zip"
              size="sm"
              inputMode="numeric"
              maxLength={5}
              placeholder="27615"
              autoComplete="postal-code"
              value={b.zip}
              onChange={(e) => b.setZip(digitsOnly(e.target.value))}
            />
          </div>
          <div className="flex flex-wrap gap-2" role="group" aria-label="How far">
            {RANGES.map((r) => (
              <Chip key={r.value} selected={b.range === r.value} onClick={() => b.setRange(r.value)}>
                {r.label}
              </Chip>
            ))}
          </div>
        </Card>

        {b.ready && (
          <Card padding="sm" className="grid grid-cols-3 text-center">
            <Stat value={nearby.filter((n) => n.status === "open").length} label="Open" tone="open" />
            <Stat value={nearby.filter((n) => n.status === "pledged").length} label="Being helped" tone="pledged" />
            <Stat value={nearby.filter((n) => n.status === "done").length} label="Received" tone="done" />
          </Card>
        )}

        <Notice variant="info" className="hidden lg:block">
          <b>Stay safe:</b> meet at public spots like libraries or church lobbies, and never share a home address.
        </Notice>
      </aside>

      <section id="needs" className="grid min-w-0 gap-4" aria-labelledby="needs-title">
        <Tabs active="/" />
        <div className="flex items-baseline justify-between gap-4">
          <h2 id="needs-title" className="m-0 text-xl font-black md:text-2xl">
            {query ? `Results for “${b.q.trim()}”` : "Needs near you"}
          </h2>
          {b.ready && (
            <span className="text-sm font-bold text-muted-foreground">
              {shown.length} {shown.length === 1 ? "post" : "posts"}
            </span>
          )}
        </div>

        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:px-0" role="group" aria-label="Category">
          {(["All", ...CATEGORIES] as const).map((c) => (
            <Chip key={c} selected={b.cat === c} onClick={() => b.setCat(c)}>
              {c}
            </Chip>
          ))}
        </div>

        {b.ready && b.loadError ? (
          <LoadError message={b.loadError} onRetry={b.reload} />
        ) : b.ready ? (
          <NeedList
            needs={shown}
            empty={emptyText}
            emptyAction={
              <Link href="/post" className={buttonVariants({ variant: "help" })}>
                Post a need
              </Link>
            }
          />
        ) : (
          <Loading />
        )}
      </section>
    </div>
  );
}

function Hero() {
  return (
    <Card as="section" variant="hero" padding="lg" className="lg:col-span-2" aria-labelledby="hero-title">
      <div className="pointer-events-none absolute -bottom-6 -right-4 hidden opacity-25 sm:block">
        <Logo size={180} motion="float" />
      </div>
      <div className="relative grid max-w-2xl gap-4 animate-fade-in-up">
        <p className="m-0 text-sm font-extrabold uppercase tracking-widest opacity-90">Neighbors helping neighbors</p>
        <h1 id="hero-title" className="m-0 text-4xl font-black leading-none tracking-tight md:text-6xl">
          A little is enough.
        </h1>
        <p className="m-0 text-base opacity-90 md:text-lg">
          Post something you need. Someone nearby drops it off at a public spot or sends it straight from your wishlist.
        </p>
        <div className="flex flex-wrap gap-2 pt-2">
          <Link href="/post" className={buttonVariants({ variant: "inverse", size: "lg" })}>
            Post a need
          </Link>
          <a href="#needs" className={buttonVariants({ variant: "onPrimary", size: "lg" })}>
            See who needs help
          </a>
        </div>
      </div>
    </Card>
  );
}

const statVariants = cva("text-2xl font-black tabular-nums md:text-3xl", {
  variants: {
    tone: {
      open: "text-primary-soft-foreground",
      pledged: "text-accent-soft-foreground",
      done: "text-success-soft-foreground",
    },
  },
});

function Stat({ value, label, tone }: { value: number; label: string; tone: "open" | "pledged" | "done" }) {
  return (
    <div className="grid gap-1">
      <b className={statVariants({ tone })}>{value}</b>
      <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{label}</span>
    </div>
  );
}
