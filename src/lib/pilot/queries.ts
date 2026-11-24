import type { SupabaseClient } from "@supabase/supabase-js";
import { ensureBusiness } from "@/lib/app/queries";
import { addDays, mondayOf, packWeek, todayIn } from "./dates";
import { matches, scorePosts } from "./scores";
import { looksLikeImage, type Checkout, type Example, type ItemSale, type Post, type SourceId, type Upload, type WeekSales } from "./types";

type Supa = Awaited<ReturnType<typeof ensureBusiness>>["supabase"];

export function uploadFolder(ownerId: string, weekOf: string) {
  return `${ownerId}/pack/${weekOf}`;
}

async function signed(supabase: Supa, paths: string[]) {
  const map = new Map<string, string>();
  if (!paths.length) return map;
  const { data } = await supabase.storage.from("clips").createSignedUrls(paths, 60 * 60);
  for (const row of data ?? []) if (row.path && row.signedUrl) map.set(row.path, row.signedUrl);
  return map;
}

function mapPost(r: Record<string, unknown>, urls: Map<string, string>): Post {
  const path = (r.media_path as string | null) ?? null;
  return {
    id: String(r.id),
    weekOf: String(r.week_of),
    position: Number(r.position),
    day: String(r.day ?? ""),
    kind: String(r.kind ?? ""),
    title: String(r.title ?? ""),
    hook: String(r.hook ?? ""),
    caption: String(r.caption ?? ""),
    items: (r.items as string[]) ?? [],
    mediaPath: path,
    mediaUrl: path ? urls.get(path) ?? null : null,
    isImage: path ? looksLikeImage(path) : false,
    status: r.status as Post["status"],
    postOn: r.post_on ? String(r.post_on) : addDays(String(r.week_of), Number(r.position) - 1),
    campaign: String(r.campaign ?? ""),
  };
}

export async function listUploads(supabase: Supa, ownerId: string, weekOf: string): Promise<Upload[]> {
  const folder = uploadFolder(ownerId, weekOf);
  const { data } = await supabase.storage.from("clips").list(folder, { limit: 40, sortBy: { column: "created_at", order: "asc" } });
  const files = (data ?? []).filter((f) => f.id);
  const paths = files.map((f) => `${folder}/${f.name}`);
  const urls = await signed(supabase, paths);
  return files.map((f, i) => ({
    path: paths[i],
    name: f.name.replace(/^\d+-/, ""),
    url: urls.get(paths[i]) ?? null,
    isImage: looksLikeImage(f.name),
  }));
}

export async function getPostsPage(week?: string) {
  const { supabase, user, business } = await ensureBusiness();
  const today = todayIn(business.timezone);
  const weekOf = week ?? packWeek(today);
  const [postsRes, uploads] = await Promise.all([
    supabase.from("posts").select("*").eq("business_id", business.id).eq("week_of", weekOf).order("position"),
    listUploads(supabase, user.id, weekOf),
  ]);
  const rows = postsRes.data ?? [];
  const urls = await signed(supabase, rows.map((r) => r.media_path).filter(Boolean));
  return { userId: user.id, business, weekOf, today, uploads, posts: rows.map((r) => mapPost(r, urls)) };
}

export async function getCheckoutPage() {
  const { supabase, business } = await ensureBusiness();
  const today = todayIn(business.timezone);
  const since = addDays(mondayOf(today), -7);
  const [c, p] = await Promise.all([
    supabase.from("checkouts").select("*").eq("business_id", business.id).eq("sold_on", today).order("created_at", { ascending: false }),
    supabase.from("posts").select("id, week_of, day, title, status").eq("business_id", business.id).gte("week_of", since).lte("week_of", today).in("status", ["approved", "posted"]).order("week_of", { ascending: false }).order("position"),
  ]);
  return {
    today,
    checkouts: (c.data ?? []).map(mapCheckout),
    posts: (p.data ?? []).map((r) => ({ id: r.id as string, label: `${r.day} · ${r.title}` })),
  };
}

function mapCheckout(r: Record<string, unknown>): Checkout {
  return {
    id: String(r.id),
    source: r.source as SourceId,
    amount: Number(r.amount),
    postId: (r.post_id as string | null) ?? null,
    soldOn: String(r.sold_on),
    createdAt: String(r.created_at),
  };
}

/** Everything the monthly proof report needs. `month` is "YYYY-MM". */
export async function getReport(month?: string) {
  const { supabase, business } = await ensureBusiness();
  const today = todayIn(business.timezone);
  const ym = month && /^\d{4}-\d{2}$/.test(month) ? month : today.slice(0, 7);
  const start = `${ym}-01`;
  const next = new Date(`${start}T12:00:00Z`);
  next.setUTCMonth(next.getUTCMonth() + 1);
  const end = next.toISOString().slice(0, 10);
  const firstWeek = mondayOf(start);

  const [biz, c, ws, items, posts, firstPack] = await Promise.all([
    supabase.from("businesses").select("plan_price").eq("id", business.id).single(),
    supabase.from("checkouts").select("*").eq("business_id", business.id).gte("sold_on", start).lt("sold_on", end),
    supabase.from("weekly_sales").select("week_of, amount").eq("business_id", business.id).order("week_of", { ascending: false }).limit(30),
    supabase.from("item_sales").select("week_of, item, sold, sold_before").eq("business_id", business.id).gte("week_of", firstWeek).lt("week_of", end),
    supabase.from("posts").select("id, week_of, day, title, items, status").eq("business_id", business.id).gte("week_of", addDays(firstWeek, -7)).lt("week_of", end).order("week_of").order("position"),
    supabase.from("posts").select("week_of").eq("business_id", business.id).in("status", ["approved", "posted"]).order("week_of").limit(1).maybeSingle(),
  ]);

  let weekly: WeekSales[] = (ws.data ?? []).map((r) => ({ weekOf: r.week_of, amount: r.amount }));
  let itemSales: ItemSale[] = (items.data ?? []).map((r) => ({ weekOf: r.week_of, item: r.item, sold: r.sold, soldBefore: r.sold_before }));
  const postRows = posts.data ?? [];

  // With Square connected, the numbers come from the register instead of being typed in.
  const [sd, idaily] = await Promise.all([
    supabase.from("sales_daily").select("day, total").eq("business_id", business.id).gte("day", addDays(today, -200)),
    supabase.from("item_daily").select("day, item, qty").eq("business_id", business.id).gte("day", addDays(firstWeek, -7)).lt("day", end),
  ]);
  const square = (sd.data ?? []).length > 0;
  if (square) {
    const byWeek = new Map<string, number>();
    for (const r of sd.data ?? []) {
      const w = mondayOf(r.day);
      if (addDays(w, 6) >= today) continue; // only finished weeks
      byWeek.set(w, (byWeek.get(w) ?? 0) + r.total);
    }
    weekly = [...byWeek].map(([weekOf, amount]) => ({ weekOf, amount }));

    const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim();
    const soldIn = (item: string, from: string, to: string) => {
      const key = norm(item);
      return (idaily.data ?? [])
        .filter((r) => r.day >= from && r.day <= to && (norm(r.item).includes(key) || key.includes(norm(r.item))))
        .reduce((s, r) => s + Number(r.qty), 0);
    };
    const auto: ItemSale[] = [];
    for (const w of [...new Set(postRows.filter((p) => p.status !== "draft").map((p) => p.week_of as string))]) {
      if (w > today) continue;
      for (const item of new Set(postRows.filter((p) => p.week_of === w).flatMap((p) => (p.items as string[]) ?? []))) {
        auto.push({ weekOf: w, item, sold: soldIn(item, w, addDays(w, 6)), soldBefore: soldIn(item, addDays(w, -7), addDays(w, -1)) });
      }
    }
    itemSales = auto;
  }

  // Weeks with a Monday inside the month, up to this week, for the entry forms.
  const weeks: string[] = [];
  for (let w = mondayOf(start) < start ? addDays(mondayOf(start), 7) : mondayOf(start); w < end && w <= today; w = addDays(w, 7)) weeks.push(w);

  return {
    business,
    today,
    month: ym,
    planPrice: (biz.data?.plan_price as number | null) ?? null,
    square,
    scores: (await scorePosts(supabase, business.id, firstWeek, today)).filter((s) => s.weekOf < end),
    checkouts: (c.data ?? []).map(mapCheckout),
    weekly,
    itemSales,
    weeks,
    startedWeek: (firstPack.data?.week_of as string | undefined) ?? null,
    posts: postRows.map((r) => ({ id: r.id as string, weekOf: r.week_of as string, label: `${r.day} · ${r.title}`, items: (r.items as string[]) ?? [], live: r.status !== "draft" })),
  };
}

export type ReportData = Awaited<ReturnType<typeof getReport>>;

/** Dollars from shoppers who said they saw a post, this month. Used on the dashboard and by the helper. */
export async function postSalesThisMonth(supabase: Supa, businessId: string, tz: string) {
  const start = `${todayIn(tz).slice(0, 7)}-01`;
  const { data } = await supabase.from("checkouts").select("amount").eq("business_id", businessId).eq("source", "post").gte("sold_on", start);
  const rows = data ?? [];
  return { amount: rows.reduce((s, r) => s + r.amount, 0), count: rows.length };
}

/** The examples the agent studies: this owner's plus the shared ones, best performers first. */
export async function loadExamples(db: SupabaseClient, ownerId: string, limit = 20): Promise<Example[]> {
  const { data } = await db
    .from("post_examples")
    .select("*")
    .or(`is_global.eq.true,owner_id.eq.${ownerId}`)
    .order("views", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []).map((r) => ({
    id: r.id,
    isGlobal: r.is_global,
    mine: r.owner_id === ownerId,
    kind: r.kind,
    hook: r.hook,
    caption: r.caption,
    why: r.why,
    views: r.views,
    likes: r.likes,
    link: r.link,
  }));
}

export async function getExamplesPage() {
  const { supabase, user } = await ensureBusiness();
  return { examples: await loadExamples(supabase, user.id, 300) };
}
export type ChartWeek = { weekOf: string; total: number; posted: number };

/**
 * The dashboard home: a month of the post calendar, the posts waiting on an okay,
 * and six weeks of sales split into the items the posts featured vs. everything else.
 */
export async function getHome(supabase: Supa, businessId: string, today: string, month?: string) {
  const ym = month && /^\d{4}-\d{2}$/.test(month) ? month : today.slice(0, 7);
  const first = `${ym}-01`;
  const gridStart = mondayOf(first);
  const nextMonth = addDays(first, 32).slice(0, 7) + "-01";
  const gridEnd = addDays(mondayOf(addDays(nextMonth, -1)), 6);
  const chartStart = addDays(mondayOf(today), -35);

  const [cal, drafts, sd, idl, posted] = await Promise.all([
    supabase.from("posts").select("*").eq("business_id", businessId).gte("post_on", gridStart).lte("post_on", gridEnd).order("post_on").order("position"),
    supabase.from("posts").select("*").eq("business_id", businessId).eq("status", "draft").gte("post_on", addDays(today, -7)).order("post_on").limit(14),
    supabase.from("sales_daily").select("day, total").eq("business_id", businessId).gte("day", chartStart).lte("day", today),
    supabase.from("item_daily").select("day, item, amount").eq("business_id", businessId).gte("day", chartStart).lte("day", today),
    supabase.from("posts").select("post_on, items").eq("business_id", businessId).neq("status", "draft").gte("post_on", chartStart).lte("post_on", today),
  ]);

  const rows = [...(cal.data ?? []), ...(drafts.data ?? [])];
  const urls = await signed(supabase, [...new Set(rows.map((r) => r.media_path).filter(Boolean))]);

  // Items each week's posts featured.
  const featured = new Map<string, string[]>();
  for (const p of posted.data ?? []) {
    const w = mondayOf(String(p.post_on));
    featured.set(w, [...(featured.get(w) ?? []), ...((p.items as string[]) ?? [])]);
  }
  const weeks: ChartWeek[] = [];
  for (let i = 0; i < 6; i++) {
    const w = addDays(chartStart, i * 7);
    const end = addDays(w, 6);
    const total = (sd.data ?? []).filter((r) => r.day >= w && r.day <= end).reduce((s, r) => s + Number(r.total), 0);
    const names = featured.get(w) ?? [];
    const fromPosts = names.length
      ? (idl.data ?? []).filter((r) => r.day >= w && r.day <= end && names.some((n) => matches(String(r.item), n))).reduce((s, r) => s + Number(r.amount), 0)
      : 0;
    weeks.push({ weekOf: w, total, posted: Math.min(fromPosts, total) });
  }

  return {
    month: ym,
    gridStart,
    gridEnd,
    calendar: (cal.data ?? []).map((r) => mapPost(r, urls)),
    drafts: (drafts.data ?? []).map((r) => mapPost(r, urls)),
    weeks,
    hasSales: (sd.data ?? []).length > 0,
  };
}

export type HomeData = Awaited<ReturnType<typeof getHome>>;
