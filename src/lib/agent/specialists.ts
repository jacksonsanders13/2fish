import sharp from "sharp";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { takeQuota } from "@/lib/app/limits";
import { addDays, DAYS, mondayOf, packWeek, todayIn, isYmd } from "@/lib/pilot/dates";
import { editPosts } from "@/lib/pilot/pack";
import { listUploads } from "@/lib/pilot/queries";
import { POST_KINDS } from "@/lib/pilot/types";
import { CAPTION_SKILL } from "@/lib/skills/captions";
import { SKILL_TEXT } from "@/lib/skills/library.generated";
import { POSTER_KIT, posterSpec } from "@/lib/skills/poster";
import { renderPoster } from "@/lib/skills/render-poster";
import { describeSnapshot } from "./snapshot";
import type { ToolContext, ToolOutcome } from "./tools";
import { claudeKey } from "@/lib/ai-key";

// Fisher's specialists. Fisher (the chat) decides what the owner needs and
// hands one job to one specialist. Each specialist is a single Claude call
// that loads only the open-source skills for its job (see src/lib/skills).
// Drafts come back to the chat as cards; nothing is posted or sent from here.

const MODEL = "claude-sonnet-5-5";

type Specialist = { label: string; skills: string[]; job: string; output: "text" | "poster" | "campaign" };

export const SPECIALISTS: Record<string, Specialist> = {
  poster: {
    label: "Poster designer",
    skills: ["canvas-design", "unslop", "image", "ad-creative"],
    job: "Design one Instagram poster (sale, event, new arrival, holiday hours) with the poster kit below, plus the caption to post with it.",
    output: "poster",
  },
  campaign: {
    label: "Campaign planner",
    skills: ["offers", "marketing-psychology", "marketing-ideas", "events", "content-strategy"],
    job: "Plan a short campaign for this store (a sale, a holiday push, an event, a launch): the offer, the dates and the posts that run it. The posts land on the owner's calendar as drafts.",
    output: "campaign",
  },
  local_seo: {
    label: "Local search",
    skills: ["gbp-optimization", "local-keyword-research", "local-schema", "seo-local", "ai-seo"],
    job: "Help this store get found on Google Maps, Google search and AI answers. Give the 5 fixes that matter most for this store, biggest first, each with the exact text or setting to use (Google Business Profile description, categories, attributes, photos, words shoppers search). Ask for nothing you can't use; mark missing facts [NEED: ...].",
    output: "text",
  },
  google_post: {
    label: "Google posts",
    skills: ["gbp-posts"],
    job: "Write Google Business Profile posts for this store (updates, offers or events). Each under 1,500 characters, the key fact in the first 100, with the button to use (Call, Learn more, Get offer, Visit).",
    output: "text",
  },
  review_reply: {
    label: "Review replies",
    skills: ["review-management"],
    job: "Write replies to the store's reviews the owner shared, in the owner's voice. Short, specific to what the reviewer said, never defensive. For an unhappy review: thank, own what's fair, offer to fix it offline. Also suggest one simple way to ask happy shoppers for reviews.",
    output: "text",
  },
  email: {
    label: "Emails",
    skills: ["emails"],
    job: "Write the email(s) the owner asked for, to their own customer list: subject line, preview text and body. Short, one reason to come in, written like the owner.",
    output: "text",
  },
  text_message: {
    label: "Texts",
    skills: ["sms"],
    job: "Write marketing text messages for customers who opted in: each under 160 characters, store name first, one reason to come in, and 'Reply STOP to opt out'. Remind the owner they can only text people who gave permission. Nothing gets sent from here.",
    output: "text",
  },
  referral: {
    label: "Referrals",
    skills: ["referrals"],
    job: "Design a simple referral idea a small store can run at the counter with no software: what the regular gets, what the friend gets, how it's tracked (a card, a name at checkout), and the exact words for the sign and the post.",
    output: "text",
  },
};

export const SPECIALIST_NAMES = Object.keys(SPECIALISTS) as [string, ...string[]];

const WRAPPER = `
You are one of Fisher's specialists at 2fish. Fisher is the marketing helper for one small, independent, local store (often a clothing or gift boutique, sometimes a bakery, salon or other shop) that sells mostly in person.

The skills below were written by marketers for all kinds of companies, often software. Use their thinking, but apply it to this one store and its owner:
- Skip any step that asks setup questions, reads files, runs tools or looks things up. You only have what's in this message.
- Use only facts from the store snapshot and Fisher's brief. If something you need is missing, write [NEED: what's missing] instead of inventing it. Never invent prices, discounts, dates, hours, addresses, stock, reviews or results.
- Write for a busy owner: plain words, short sentences, specific. No headers or markdown tables unless the job needs a list. Under 350 words unless the job is a set of drafts.
- Everything you write is a draft the owner approves. Nothing gets posted or sent.
`.trim();

function skillBlock(names: string[]) {
  return names.map((n) => `<skill name="${n}">\n${SKILL_TEXT[n] ?? ""}\n</skill>`).join("\n\n");
}

export async function runSpecialist(kind: string, brief: string, ctx: ToolContext): Promise<ToolOutcome> {
  const spec = SPECIALISTS[kind];
  if (!spec) return { summary: `No specialist called ${kind}. Options: ${SPECIALIST_NAMES.join(", ")}.` };
  const key = claudeKey();
  if (!key) return { summary: "Specialists need the Claude key, which isn't set up yet." };
  if (!(await takeQuota(ctx.supabase, "skill"))) return { summary: "That's the daily limit for specialist jobs (20). It resets tomorrow." };

  const { supabase, business, ownerId, snapshot } = ctx;
  const today = todayIn(business.timezone || "America/New_York");
  // A full week plan can take close to two minutes to write.
  const client = new Anthropic({ apiKey: key, timeout: 120_000, maxRetries: 0 });

  const extra = spec.output === "poster" ? POSTER_KIT : spec.output === "campaign" ? CAMPAIGN_FORMAT : "";
  const writing = spec.output === "text" ? "" : CAPTION_SKILL;
  const system: Anthropic.TextBlockParam[] = [
    // The skills are the big, unchanging part, so they're cached between calls.
    { type: "text", text: `${WRAPPER}\n\n${skillBlock(spec.skills)}`, cache_control: { type: "ephemeral" } },
    { type: "text", text: [`YOUR JOB: ${spec.job}`, writing, extra].filter(Boolean).join("\n\n") },
  ];

  const content: Anthropic.ContentBlockParam[] = [
    { type: "text", text: `Today is ${today}.\n\nSTORE SNAPSHOT\n${describeSnapshot(snapshot)}\n\nFISHER'S BRIEF FROM THE OWNER\n${brief}` },
  ];

  // The poster designer gets to see the store's latest photos.
  let files: { path: string; name: string; url: string | null; isImage: boolean }[] = [];
  if (spec.output === "poster") {
    const weeks = [packWeek(today), mondayOf(today)];
    for (const w of [...new Set(weeks)]) files.push(...(await listUploads(supabase, ownerId, w)));
    files = files.filter((f) => f.isImage && /\.(jpe?g|png|webp)$/i.test(f.name)).slice(0, 6);
    content.push({ type: "text", text: files.length ? `Photos you can use (index: name):\n${files.map((f, i) => `${i}: ${f.name}`).join("\n")}` : "No photos uploaded. Use layout type." });
    files.forEach((f, i) => {
      if (!f.url) return;
      content.push({ type: "text", text: `Photo ${i}:` });
      content.push({ type: "image", source: { type: "url", url: f.url } });
    });
  }

  // A week of posts with captions is long, so the planner gets more room. If a
  // reply comes back cut off or not as JSON, ask once more before giving up.
  const ask = async () => {
    // Room counts the model's thinking too, not just the answer, so the planner
    // needs a lot of it.
    const res = await client.messages.create({ model: MODEL, max_tokens: spec.output === "campaign" ? 16000 : 4000, system, messages: [{ role: "user", content }] });
    const out = res.content.map((b) => (b.type === "text" ? b.text : "")).join("").trim();
    if (res.stop_reason === "max_tokens")
      console.error("specialist reply cut off", kind, out.length, "chars", res.usage.output_tokens, "tokens", res.content.map((b) => b.type).join(","));
    return { out, cut: res.stop_reason === "max_tokens" };
  };
  let text = "";
  try {
    let r = await ask();
    if (spec.output !== "text" && (r.cut || parseJson(r.out) == null)) {
      console.error("specialist retry", kind, r.cut ? "cut off" : "not JSON", r.out.slice(0, 200));
      r = await ask();
    }
    text = r.out;
  } catch (e) {
    console.error("specialist failed", kind, e);
    return { summary: `The ${spec.label.toLowerCase()} couldn't finish just now. Try again in a minute.` };
  }

  if (spec.output === "text") {
    return {
      summary: `${spec.label} draft is in the chat for the owner to read and copy. Summarize it in a sentence or two; don't repeat it.\n\nDRAFT:\n${text}`,
      card: { kind: "draft", title: spec.label, body: text },
    };
  }

  const json = parseJson(text);
  if (spec.output === "poster") {
    const parsed = posterSpec.safeParse(json);
    if (!parsed.success) return { summary: "The poster designer sent back something unusable. Try asking again with the sale or event details." };
    const p = parsed.data;
    const photo = p.photo != null && files[p.photo] ? files[p.photo].path : null;
    const finalSpec = { ...p, layout: photo ? p.layout : "type", photo: null };
    const { data, error } = await supabase.from("posters").insert({ business_id: business.id, owner_id: ownerId, spec: finalSpec, media_path: photo }).select("id").single();
    if (error) return { summary: `Couldn't save the poster: ${error.message}` };
    const posterId = data.id as string;
    const card = { kind: "poster" as const, posterId, title: p.headline, body: p.caption };

    // Save the finished poster as the photo on a draft post, so it waits in Posts to approve.
    const postOn = isYmd(p.date) && p.date >= today ? p.date : today;
    try {
      const src = photo ? ((await supabase.storage.from("clips").createSignedUrl(photo, 300)).data?.signedUrl ?? null) : null;
      const png = await (await renderPoster({ spec: { ...finalSpec, layout: src ? p.layout : "type" }, photo: src, store: business.name || "" })).arrayBuffer();
      const path = `${ownerId}/posters/${posterId}.jpg`;
      // Instagram only takes JPEG, so the poster is saved as one.
      const jpg = await sharp(Buffer.from(png)).flatten({ background: "#ffffff" }).jpeg({ quality: 90 }).toBuffer();
      const up = await supabase.storage.from("clips").upload(path, new Uint8Array(jpg), { contentType: "image/jpeg", upsert: true });
      if (up.error) throw up.error;
      const idx = (new Date(`${postOn}T12:00:00Z`).getUTCDay() + 6) % 7;
      const ins = await supabase.from("posts").insert({
        business_id: business.id,
        owner_id: ownerId,
        week_of: mondayOf(postOn),
        position: idx + 1,
        day: DAYS[idx],
        post_on: postOn,
        kind: POST_KINDS.includes(p.kind as (typeof POST_KINDS)[number]) ? p.kind : "sale",
        title: p.headline,
        hook: p.headline,
        caption: p.caption,
        items: [],
        media_path: path,
        slides: [path],
      });
      if (ins.error) throw ins.error;
    } catch (e) {
      console.error("poster: couldn't add it as a draft post", e);
      return { summary: `Poster made and shown in the chat: "${p.headline}". It couldn't be added to Posts to approve, so the owner can download it from the chat.`, card };
    }
    return {
      summary: `Poster made: "${p.headline}". It's now a draft post for ${postOn}, waiting in Posts to approve. Tell the owner, in about these words: "Your post is in Posts to approve, waiting for your okay." Don't describe the poster again.`,
      card,
      madePosts: 1,
    };
  }

  // Campaign: a plan plus draft posts on the calendar.
  const parsed = campaignSchema.safeParse(json);
  if (!parsed.success) console.error("campaign unusable", json == null ? "not JSON" : parsed.error.issues.slice(0, 3));
  if (!parsed.success) return { summary: "The campaign planner sent back something unusable. Try again with the dates and the offer." };
  const plan = parsed.data;
  const posts = plan.posts.filter((p) => isYmd(p.date) && p.date >= today && p.date <= addDays(today, 90)).slice(0, 10);
  const cleaned = await editPosts(client, posts);
  if (cleaned.length) {
    const rows = cleaned.map((p) => {
      const idx = (new Date(`${p.date}T12:00:00Z`).getUTCDay() + 6) % 7;
      return {
        business_id: business.id,
        owner_id: ownerId,
        week_of: mondayOf(p.date),
        position: idx + 1,
        day: DAYS[idx],
        post_on: p.date,
        kind: POST_KINDS.includes(p.kind as (typeof POST_KINDS)[number]) ? p.kind : "sale",
        title: p.title,
        hook: p.hook,
        caption: p.caption,
        items: p.items,
        shots: p.shots,
        campaign: plan.campaign,
      };
    });
    const { error } = await supabase.from("posts").insert(rows);
    if (error) return { summary: `Planned it, but couldn't add the posts to the calendar: ${error.message}\n\nPLAN:\n${plan.summary}` };
  }
  const body = `${plan.summary}\n\n${cleaned.length} draft posts are waiting in Posts to approve, under "${plan.campaign}".`;
  return {
    summary: `Campaign "${plan.campaign}" planned. ${cleaned.length} draft posts added, waiting in Posts to approve. Tell the owner the plan in two sentences, then: "Your ${cleaned.length} posts are in Posts to approve, waiting for your okay."\n\nPLAN:\n${plan.summary}`,
    card: { kind: "draft", title: `Campaign: ${plan.campaign}`, body },
    madePosts: cleaned.length,
  };
}

const CAMPAIGN_FORMAT = `
Reply with JSON only:
{"campaign": short name like "Holiday gift week",
 "summary": the plan for the owner in under 150 words (the offer, the dates, what to set up in the store, what to say at the counter),
 "posts": [{"date":"YYYY-MM-DD","kind":one of ${POST_KINDS.join(", ")},"title":string,"hook":string,"caption":string,"items":string[],"shots":string[]}]}
3 to 8 posts, all on or after today, spaced over the campaign (a teaser before, the main days, a last-chance post). Every post follows the caption rules.
No video or Reels: each post is one photo or a slideshow of 2 to 10. "shots" lists the photos the owner should take for that post, in slide order, each a short specific instruction ("The sale rack, wide, from the door"). 1 to 6 shots.
`.trim();

const campaignSchema = z.object({
  campaign: z.string().trim().min(1).transform((v) => v.slice(0, 80)),
  summary: z.string().trim().min(1).transform((v) => v.slice(0, 2000)),
  posts: z
    .array(
      z.object({
        date: z.string(),
        kind: z.string().transform((v) => v.slice(0, 40)),
        title: z.string().trim().min(1).transform((v) => v.slice(0, 80)),
        hook: z.string().trim().default("").transform((v) => v.slice(0, 140)),
        caption: z.string().trim().default("").transform((v) => v.slice(0, 900)),
        items: z.array(z.string().transform((v) => v.slice(0, 120))).default([]).transform((v) => v.slice(0, 6)),
        shots: z.array(z.string().transform((v) => v.slice(0, 160))).default([]).transform((v) => v.slice(0, 6)),
      }),
    )
    .transform((v) => v.slice(0, 12)),
});

function parseJson(text: string): unknown {
  try {
    return JSON.parse(text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1));
  } catch {
    return null;
  }
}
