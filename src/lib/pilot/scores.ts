import type { SupabaseClient } from "@supabase/supabase-js";
import { addDays } from "./dates";

// How each post did, from Square: units of its items sold the week it went up
// vs. the week before, turned into dollars at the items' own average price.
// It's evidence, not proof: other things move sales too.

export type PostScore = {
  id: string;
  weekOf: string;
  day: string;
  kind: string;
  title: string;
  campaign: string;
  items: { item: string; sold: number; before: number }[];
  sold: number;
  before: number;
  extraDollars: number;
  partial: boolean; // the week isn't over yet
};

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim();
export const matches = (squareName: string, postItem: string) => {
  const a = norm(squareName);
  const b = norm(postItem);
  return Boolean(a && b) && (a.includes(b) || b.includes(a));
};

export async function scorePosts(db: SupabaseClient, businessId: string, sinceWeek: string, today: string): Promise<PostScore[]> {
  const [p, i] = await Promise.all([
    db.from("posts").select("*").eq("business_id", businessId).neq("status", "draft").gte("week_of", sinceWeek).lte("week_of", today).order("week_of").order("position"),
    db.from("item_daily").select("day, item, qty, amount").eq("business_id", businessId).gte("day", addDays(sinceWeek, -7)).lte("day", today),
  ]);
  const rows = (i.data ?? []).map((r) => ({ day: r.day as string, item: r.item as string, qty: Number(r.qty), amount: Number(r.amount) }));
  if (!rows.length) return [];

  return (p.data ?? []).map((post) => {
    const w = post.week_of as string;
    const items = ((post.items as string[]) ?? []).map((name) => {
      const hits = rows.filter((r) => matches(r.item, name));
      const inWeek = hits.filter((r) => r.day >= w && r.day <= addDays(w, 6));
      const prior = hits.filter((r) => r.day >= addDays(w, -7) && r.day < w);
      const qty = hits.reduce((s, r) => s + r.qty, 0);
      const price = qty ? hits.reduce((s, r) => s + r.amount, 0) / qty : 0;
      const sold = inWeek.reduce((s, r) => s + r.qty, 0);
      const before = prior.reduce((s, r) => s + r.qty, 0);
      return { item: name, sold, before, dollars: (sold - before) * price };
    });
    return {
      id: post.id as string,
      weekOf: w,
      day: post.day as string,
      kind: post.kind as string,
      title: post.title as string,
      campaign: String(post.campaign ?? ""),
      items: items.map(({ item, sold, before }) => ({ item, sold, before })),
      sold: items.reduce((s, x) => s + x.sold, 0),
      before: items.reduce((s, x) => s + x.before, 0),
      extraDollars: Math.round(items.reduce((s, x) => s + x.dollars, 0)),
      partial: addDays(w, 6) >= today,
    };
  });
}

/** What the agent learned: which kinds of posts sold, in plain words, plus a version for the writer. */
export function learnings(scores: PostScore[]) {
  const done = scores.filter((s) => !s.partial && s.items.length);
  const byKind = new Map<string, { total: number; n: number }>();
  for (const s of done) {
    const k = byKind.get(s.kind) ?? { total: 0, n: 0 };
    k.total += s.extraDollars;
    k.n += 1;
    byKind.set(s.kind, k);
  }
  const kinds = [...byKind].map(([kind, v]) => ({ kind, avg: Math.round(v.total / v.n), n: v.n })).sort((a, b) => b.avg - a.avg);
  if (kinds.length < 2) {
    return { summary: null as string | null, forWriter: "", best: kinds[0]?.kind ?? null };
  }
  const best = kinds[0];
  const worst = kinds[kinds.length - 1];
  const summary =
    best.avg > 0
      ? `${cap(best.kind)} posts sold the most, about $${best.avg.toLocaleString()} extra each. ${cap(worst.kind)} sold the least, so next week leans on ${best.kind}.`
      : `No kind of post has lifted sales yet. Next week tries new hooks and more ${best.kind} posts.`;
  const forWriter =
    "Results so far for this store (extra dollars of the featured items, week posted vs. week before): " +
    kinds.map((k) => `${k.kind} ${k.avg >= 0 ? "+" : ""}$${k.avg} per post (${k.n} posts)`).join("; ") +
    `. Make more of what sold (${best.kind}) and fewer of what didn't (${worst.kind}).` +
    byItem(done);
  return { summary, forWriter, best: best.kind };
}

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// Which products moved after they were posted, and with which kind of post.
// This is the memory the next pack leans on: feature what responds, try a new
// angle on what didn't.
function byItem(done: PostScore[]) {
  const items = new Map<string, { extra: number; n: number; kinds: Map<string, number> }>();
  for (const s of done) {
    for (const it of s.items) {
      const key = it.item.toLowerCase();
      const row = items.get(key) ?? { extra: 0, n: 0, kinds: new Map() };
      const extra = it.sold - it.before;
      row.extra += extra;
      row.n += 1;
      row.kinds.set(s.kind, (row.kinds.get(s.kind) ?? 0) + extra);
      items.set(key, row);
    }
  }
  if (!items.size) return "";
  const ranked = [...items]
    .map(([item, r]) => ({ item, avg: Math.round(r.extra / r.n), n: r.n, bestKind: [...r.kinds].sort((a, b) => b[1] - a[1])[0]?.[0] }))
    .sort((a, b) => b.avg - a.avg);
  const up = ranked.filter((r) => r.avg > 0).slice(0, 5);
  const flat = ranked.filter((r) => r.avg <= 0).slice(-3);
  const parts: string[] = [];
  if (up.length) parts.push("Products that sold more after being posted: " + up.map((r) => `${r.item} +$${r.avg} (best as ${r.bestKind})`).join("; ") + ". Feature these again, in the kind of post that worked.");
  if (flat.length) parts.push("Products that didn't move: " + flat.map((r) => r.item).join(", ") + ". If they come up again, try a different kind of post or hook.");
  return " " + parts.join(" ");
}
