import { siteUrl, textOwner } from "@/lib/integrations/notify";
import { adminClient } from "@/lib/supabase/admin";
import { addDays, packWeek, todayIn, weekdayOf } from "./dates";
import { buildPack } from "./pack";
import { loadExamples } from "./queries";
import { learnings, scorePosts } from "./scores";
import { looksLikeImage } from "./types";

// The agent's weekly job, on the day each owner picked (Monday by default): pick
// what to feature from what's selling, write the next week's 7 posts as drafts,
// and leave them for the owner to approve. Nothing posts without that approval.
// Runs every day; stores whose day it isn't are skipped.
export async function weeklyAutopilot() {
  const admin = adminClient();
  if (!admin) return [];
  const { data: conns } = await admin.from("square_connections").select("business_id, owner_id");
  const out: { business: string; made: boolean; why?: string }[] = [];

  for (const c of conns ?? []) {
    try {
      const { data: biz } = await admin.from("businesses").select("name, city, timezone, pack_day").eq("id", c.business_id).single();
      const today = todayIn((biz?.timezone as string) || "America/New_York");
      if (weekdayOf(today) !== ((biz?.pack_day as number | null) ?? 1)) {
        out.push({ business: c.business_id, made: false, why: "not their day" });
        continue;
      }
      const week = packWeek(today);

      const existing = await admin.from("posts").select("id", { count: "exact", head: true }).eq("business_id", c.business_id).eq("week_of", week);
      if ((existing.count ?? 0) > 0) {
        out.push({ business: c.business_id, made: false, why: "already has posts" });
        continue;
      }

      // Best sellers over the last 2 weeks become the week's featured items.
      const { data: items } = await admin.from("item_daily").select("item, qty").eq("business_id", c.business_id).gte("day", addDays(today, -14));
      const totals = new Map<string, number>();
      for (const r of items ?? []) totals.set(r.item, (totals.get(r.item) ?? 0) + Number(r.qty));
      const top = [...totals].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name]) => name);

      const folder = `${c.owner_id}/pack/${week}`;
      const { data: files } = await admin.storage.from("clips").list(folder, { limit: 40 });
      const paths = (files ?? []).filter((f) => f.id).map((f) => `${folder}/${f.name}`);
      const { data: signed } = paths.length ? await admin.storage.from("clips").createSignedUrls(paths, 3600) : { data: [] };
      const media = paths.map((p, i) => ({ path: p, name: p.split("/").pop()!.replace(/^\d+-/, ""), url: signed?.[i]?.signedUrl ?? null, isImage: looksLikeImage(p) }));

      if (!top.length && !media.length) {
        out.push({ business: c.business_id, made: false, why: "no sales or photos yet" });
        continue;
      }

      const [examples, scores] = await Promise.all([loadExamples(admin, c.owner_id), scorePosts(admin, c.business_id, addDays(week, -56), today)]);
      const { posts } = await buildPack({ store: (biz?.name as string) || "the store", city: (biz?.city as string) || "", notes: top.join("\n"), media, examples, results: learnings(scores).forWriter });
      const { error } = await admin.from("posts").insert(
        posts.map((p) => ({ business_id: c.business_id, owner_id: c.owner_id, week_of: week, position: p.position, day: p.day, kind: p.kind, title: p.title, hook: p.hook, caption: p.caption, items: p.items, media_path: p.mediaPath, post_on: addDays(week, p.position - 1), campaign: p.campaign })),
      );
      if (error) throw error;
      await textOwner(
        admin,
        c.business_id,
        `your next 7 posts are ready${top.length ? ` (featuring ${top.slice(0, 2).join(" and ")})` : ""}. Approve them here: ${siteUrl()}/dashboard/videos`,
      );
      await admin.from("events").insert({
        business_id: c.business_id,
        owner_id: c.owner_id,
        kind: "video",
        text: `7 posts drafted for this week from your best sellers${top.length ? ` (${top.slice(0, 3).join(", ")})` : ""}. Waiting on your okay.`,
      });
      out.push({ business: c.business_id, made: true });
    } catch (e) {
      out.push({ business: c.business_id, made: false, why: e instanceof Error ? e.message : "failed" });
    }
  }
  return out;
}

// 3 days before each store's pack day: say which items it plans to feature
// and ask for photos of them, so the posts have something real to show.
export async function fridayPhotoAsk() {
  const admin = adminClient();
  if (!admin) return [];
  const { data: conns } = await admin.from("square_connections").select("business_id, owner_id");
  const out: { business: string; asked: boolean }[] = [];

  for (const c of conns ?? []) {
    const { data: biz } = await admin.from("businesses").select("timezone, pack_day").eq("id", c.business_id).single();
    const today = todayIn((biz?.timezone as string) || "America/New_York");
    // Ask 3 days before their pack day.
    const packDay = (biz?.pack_day as number | null) ?? 1;
    if (weekdayOf(today) !== (packDay + 4) % 7) {
      out.push({ business: c.business_id, asked: false });
      continue;
    }
    const week = packWeek(addDays(today, 3));
    const { data: items } = await admin.from("item_daily").select("item, qty").eq("business_id", c.business_id).gte("day", addDays(today, -14));
    const totals = new Map<string, number>();
    for (const r of items ?? []) totals.set(r.item, (totals.get(r.item) ?? 0) + Number(r.qty));
    const top = [...totals].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([name]) => name);
    if (!top.length) {
      out.push({ business: c.business_id, asked: false });
      continue;
    }
    const r = await textOwner(
      admin,
      c.business_id,
      `next week I'm featuring ${top.join(", ")}. Send 3 to 5 photos or short clips of them in the next couple of days: ${siteUrl()}/dashboard/videos?week=${week}`,
    );
    if (r.status !== "skipped") {
      await admin.from("events").insert({ business_id: c.business_id, owner_id: c.owner_id, kind: "reminder", text: `Asked for photos of ${top.join(", ")} for next week.` });
    }
    out.push({ business: c.business_id, asked: r.status === "sent" });
  }
  return out;
}
