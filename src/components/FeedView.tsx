"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import Avatar from "./Avatar";
import NeedList from "./NeedList";
import Tabs from "./Tabs";
import Loading from "./Loading";
import { useBoard } from "./BoardProvider";
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
  if (!b.ready) return <Loading />;

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
    <>
      {/* "What do you need help with?" box */}
      <div className="box grid gap-2.5 p-3">
        <div className="flex items-center gap-2.5">
          <Avatar name={b.displayName} color="var(--brand)" />
          <Link
            href="/post"
            onClick={() => b.setDraftCategory(null)}
            className="flex-1 rounded-full bg-page px-4 py-[11px] text-left text-muted no-underline"
          >
            What do you need help with?
          </Link>
        </div>
        <div className="flex flex-wrap gap-1.5 border-t border-line pt-2">
          {QUICK.map((qb) => (
            <button
              key={qb.cat}
              type="button"
              className="min-w-[92px] flex-1 cursor-pointer rounded-lg p-[7px] text-sm font-bold text-muted hover:bg-page"
              onClick={() => {
                b.setDraftCategory(qb.cat);
                router.push("/post");
              }}
            >
              {qb.label}
            </button>
          ))}
        </div>
      </div>

      {/* ZIP + how far */}
      <div className="box flex flex-wrap items-center gap-2 px-3 py-2.5">
        <label htmlFor="zip" className="label">
          Your ZIP
        </label>
        <input
          id="zip"
          inputMode="numeric"
          maxLength={5}
          placeholder="27615"
          autoComplete="postal-code"
          value={b.zip}
          onChange={(e) => b.setZip(digitsOnly(e.target.value))}
          className="w-[92px] rounded-lg border border-line bg-page px-2.5 py-[7px] tabular-nums"
        />
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="How far">
          {RANGES.map((r) => (
            <button key={r.value} type="button" className="chip" aria-pressed={b.range === r.value} onClick={() => b.setRange(r.value)}>
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* stats */}
      <div className="box grid grid-cols-3 px-1 py-2.5 text-center">
        <Stat value={nearby.filter((n) => n.status === "open").length} label="Open needs" color="text-brand" />
        <Stat value={nearby.filter((n) => n.status === "pledged").length} label="Being helped" color="text-warn" />
        <Stat value={nearby.filter((n) => n.status === "done").length} label="Received" color="text-go" />
      </div>

      <Tabs active="/" />

      <div className="flex gap-1.5 overflow-x-auto pb-0.5" role="group" aria-label="Category">
        {(["All", ...CATEGORIES] as const).map((c) => (
          <button key={c} type="button" className="chip" aria-pressed={b.cat === c} onClick={() => b.setCat(c)}>
            {c}
          </button>
        ))}
      </div>

      <NeedList needs={shown} empty={emptyText} />
    </>
  );
}

function Stat({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div className="grid">
      <b className={`text-[22px] font-black tabular-nums ${color}`}>{value}</b>
      <span className="text-xs font-bold uppercase tracking-[.04em] text-muted">{label}</span>
    </div>
  );
}
