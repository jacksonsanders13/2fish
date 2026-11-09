"use client";

import { MapPin, ShieldCheck } from "lucide-react";
import { useBoard } from "./BoardProvider";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Segmented } from "./ui/segmented";
import { Heading, Text } from "./ui/typography";
import { digitsOnly, zipOk } from "@/lib/format";
import type { Need, Range } from "@/lib/types";

const RANGES = [
  { value: "zip", label: "My ZIP" },
  { value: "area", label: "Nearby" },
  { value: "all", label: "Anywhere" },
] as const satisfies readonly { value: Range; label: string }[];

// Nearby = same first 3 digits of the ZIP. Good enough for now.
export function useNearby() {
  const b = useBoard();
  const inRange = (n: Need) => {
    if (b.range === "all" || !zipOk(b.zip)) return true;
    if (b.range === "zip") return n.zip === b.zip;
    return n.zip.slice(0, 3) === b.zip.slice(0, 3);
  };
  return b.needs.filter(inRange);
}

// ZIP field + how-far switch. One line in the feed, stacked in the narrow rail.
export function LocationControls({ idPrefix, stacked = false }: { idPrefix: string; stacked?: boolean }) {
  const b = useBoard();
  return (
    <div className={stacked ? "grid gap-2" : "flex items-center gap-2"}>
      <label htmlFor={`${idPrefix}-zip`} className={stacked ? "relative" : "relative flex-none"}>
        <span className="sr-only">Your ZIP</span>
        <MapPin aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-primary" />
        <Input
          id={`${idPrefix}-zip`}
          tone="search"
          size="sm"
          withIcon
          className={stacked ? "tabular-nums" : "w-28 tabular-nums"}
          inputMode="numeric"
          maxLength={5}
          placeholder="ZIP"
          autoComplete="postal-code"
          value={b.zip}
          onChange={(e) => b.setZip(digitsOnly(e.target.value))}
        />
      </label>
      <Segmented label="How far" options={RANGES} value={b.range} onChange={b.setRange} className={stacked ? "" : "min-w-0 flex-1"} />
    </div>
  );
}

export function AreaCard() {
  return (
    <Card variant="flat" padding="sm" className="grid gap-3">
      <Heading level="section">Your area</Heading>
      <LocationControls idPrefix="rail" stacked />
    </Card>
  );
}

export function StatsCard() {
  const { ready } = useBoard();
  const nearby = useNearby();
  const count = (s: Need["status"]) => nearby.filter((n) => n.status === s).length;
  const stats = [
    { label: "Open", value: count("open"), tone: "text-primary-soft-foreground" },
    { label: "Being helped", value: count("pledged"), tone: "text-accent-soft-foreground" },
    { label: "Received", value: count("done"), tone: "text-success-soft-foreground" },
  ];
  return (
    <Card variant="flat" padding="sm" className="grid gap-3">
      <Heading level="section">Near you</Heading>
      <dl className="m-0 grid grid-cols-3 gap-2">
        {stats.map((s) => (
          <div key={s.label} className="grid gap-0.5">
            <dd className={`m-0 font-display text-3xl font-extrabold tabular-nums ${s.tone}`}>{ready ? s.value : "–"}</dd>
            <dt>
              <Text as="span" variant="micro">
                {s.label}
              </Text>
            </dt>
          </div>
        ))}
      </dl>
    </Card>
  );
}

export function SafetyCard() {
  return (
    <Card variant="flat" padding="sm" className="flex gap-3">
      <ShieldCheck aria-hidden="true" className="size-5 flex-none text-primary" />
      <Text variant="meta">
        <b className="text-foreground">Stay safe.</b> Meet at public spots like libraries or church lobbies, and never share a home address.
      </Text>
    </Card>
  );
}
