import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { DAYS } from "./dates";
import { POST_KINDS } from "./types";

export type PackMedia = { path: string; name: string; url: string | null; isImage: boolean };
export type PostDraft = {
  position: number;
  day: string;
  kind: string;
  title: string;
  hook: string;
  caption: string;
  items: string[];
  mediaPath: string | null;
  campaign: string;
};

const draftSchema = z.object({
  kind: z.string().max(40),
  title: z.string().max(80),
  hook: z.string().max(140),
  caption: z.string().max(600),
  items: z.array(z.string().max(120)).max(6),
  media: z.number().int().nullable().optional(),
  campaign: z.string().max(80).nullable().optional(),
});

// Claude can look at these photo types. HEIC and videos go in by file name only.
const VISION = /\.(jpe?g|png|webp|gif)$/i;
const MAX_IMAGES = 8;

/** Seven posts, Monday to Sunday. Claude writes them when it can; otherwise a plain template. */
export async function buildPack(input: {
  store: string;
  city: string;
  notes: string;
  media: PackMedia[];
  results?: string;
  examples?: { kind: string; hook: string; caption: string; why: string; views: number | null; likes: number | null }[];
}): Promise<{ posts: PostDraft[]; model: string | null }> {
  const items = input.notes
    .split(/\n|,/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 30);
  const fallback = { posts: templatePack(input.store, items, input.media), model: null };

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return fallback;

  try {
    const client = new Anthropic({ apiKey: key, timeout: 90_000, maxRetries: 1 });
    const model = "claude-sonnet-5-5";
    const content: Anthropic.ContentBlockParam[] = [];
    const list = input.media.map((m, i) => `${i}: ${m.name}${m.isImage ? "" : " (video clip)"}`).join("\n");
    content.push({
      type: "text",
      text: `Store: ${input.store}${input.city ? ` in ${input.city}` : ""}\n\nWhat's in the store this week, from the owner:\n${input.notes.trim() || "(nothing written)"}\n\nFiles the owner sent (index: name):\n${list || "(none)"}\n\nThe photos you can see follow, in index order.`,
    });
    if (input.results) content.push({ type: "text", text: input.results });

    // Popular posts to learn from. Patterns only: the words stay theirs.
    const examples = (input.examples ?? []).slice(0, 20);
    if (examples.length) {
      const lines = examples.map((x, i) => {
        const stats = [x.views != null ? `${x.views.toLocaleString()} views` : "", x.likes != null ? `${x.likes.toLocaleString()} likes` : ""].filter(Boolean).join(", ");
        return `${i + 1}. [${x.kind}]${stats ? ` (${stats})` : ""} hook: "${x.hook}" caption: "${x.caption.slice(0, 400)}"${x.why ? ` why it worked: ${x.why}` : ""}`;
      });
      content.push({ type: "text", text: `Posts that did well for other stores. Study their patterns:\n${lines.join("\n")}` });
    }

    let shown = 0;
    input.media.forEach((m, i) => {
      if (shown >= MAX_IMAGES || !m.url || !VISION.test(m.name)) return;
      content.push({ type: "text", text: `File ${i}:` });
      content.push({ type: "image", source: { type: "url", url: m.url } });
      shown++;
    });

    const res = await client.messages.create({
      model,
      max_tokens: 2500,
      system: [
        "You write a week of Instagram and TikTok posts for a small independent store. The owner approves every post before it goes up.",
        `Write exactly 7 posts, Monday to Sunday. Mix the kinds: ${POST_KINDS.join(", ")}. Use "sale" only if the owner mentions a sale.`,
        "Each post features 1 to 3 specific items from the owner's list or clearly visible in a photo. Name items the way a shopper would ask for them at the counter (\"green wrap dress\").",
        "hook: the first line someone reads, under 12 words. caption: under 220 characters, plain and warm, ends by giving a reason to come in. Up to 3 hashtags, local ones welcome. No emoji. No promo codes or discounts unless the owner wrote one. Never invent prices, sizes or stock counts.",
        "Never use: unlock, elevate, curated, obsessed, must-have, game-changer, journey, vibes.",
        "If example posts are given, borrow what made them work (hook style, format, structure, pacing) and apply it to this store's items. Never copy their words, names or claims.",
        "media: the index of the file that fits the post best, or null. Spread the files across the week.",
        "If the owner mentions a sale, holiday or event, the posts that push it share one short campaign name (\"Holiday gift week\"). Every other post gets an empty campaign.",
        'Reply with JSON only: {"posts":[{"kind":string,"title":string,"hook":string,"caption":string,"items":string[],"media":number|null,"campaign":string}]}',
      ].join("\n"),
      messages: [{ role: "user", content }],
    });

    const text = res.content.map((b) => (b.type === "text" ? b.text : "")).join("");
    const json = JSON.parse(text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1));
    const parsed = z.object({ posts: z.array(draftSchema).min(7) }).parse(json).posts.slice(0, 7);
    return {
      model,
      posts: parsed.map((p, i) => ({
        position: i + 1,
        day: DAYS[i],
        kind: POST_KINDS.includes(p.kind as (typeof POST_KINDS)[number]) ? p.kind : "in the shop",
        title: p.title.trim(),
        hook: p.hook.trim(),
        caption: p.caption.trim(),
        items: p.items.map((x) => x.trim()).filter(Boolean),
        mediaPath: typeof p.media === "number" ? input.media[p.media]?.path ?? null : null,
        campaign: (p.campaign ?? "").trim(),
      })),
    };
  } catch (e) {
    console.error("pack: falling back to template", e);
    return fallback;
  }
}

const PLAN: { kind: string; title: (item: string) => string; hook: (item: string) => string; caption: (item: string, store: string) => string }[] = [
  { kind: "try-on", title: (x) => `Try-on: ${x}`, hook: (x) => `Three ways to wear the ${x}`, caption: (x, s) => `The ${x}, tried on. Come try it yourself at ${s} this week.` },
  { kind: "new arrival", title: (x) => `Just in: ${x}`, hook: () => "New this week, and there aren't many", caption: (x, s) => `The ${x} just landed at ${s}. Small run, so come early.` },
  { kind: "behind the scenes", title: () => "Behind the counter", hook: () => "How we pick what goes on the front table", caption: (x, s) => `A peek at how we set up ${s} this week, starting with the ${x}.` },
  { kind: "outfit", title: (x) => `One outfit around the ${x}`, hook: () => "One outfit, start to finish", caption: (x, s) => `Built around the ${x}. Every piece is in ${s} right now.` },
  { kind: "gift idea", title: (x) => `Gift idea: ${x}`, hook: () => "The gift you won't find at the mall", caption: (x, s) => `Looking for a gift? The ${x} is a good one. We'll wrap it at ${s}.` },
  { kind: "in the shop", title: () => "Saturday in the shop", hook: () => "Come say hi this weekend", caption: (x, s) => `${s} this Saturday: the ${x} and a lot more. Come say hi.` },
  { kind: "in the shop", title: () => "The store in 15 seconds", hook: () => "In case you haven't been in yet", caption: (_x, s) => `Clothes, gifts and good light in the dressing room. That's ${s}.` },
];

function templatePack(store: string, items: string[], media: PackMedia[]): PostDraft[] {
  const pick = (i: number) => items[i % Math.max(items.length, 1)] || "new arrivals";
  return PLAN.map((p, i) => {
    const item = pick(i);
    return {
      position: i + 1,
      day: DAYS[i],
      kind: p.kind,
      title: p.title(item),
      hook: p.hook(item),
      caption: p.caption(item, store),
      items: items.length ? [item] : [],
      mediaPath: media.length ? media[i % media.length].path : null,
      campaign: "",
    };
  });
}
