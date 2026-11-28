"use server";

import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { claudeKey } from "@/lib/ai-key";
import { ensureBusiness } from "@/lib/app/queries";

// A quick look at every uploaded photo before it can end up in a post. Anything
// that isn't usable for a store post is deleted and the owner hears why. If the
// check itself fails, the photos stay: the owner still approves every post.

const RULES = `You check photos a small store owner uploaded for their Instagram posts.
Reject a photo only if it is:
- a screenshot, meme, document, receipt, or a photo of a screen
- too dark or blurry to post
- nudity or underwear worn by a person (underwear on a hanger or table is fine)
- a child as the main subject
- someone else's ad or Instagram post with their logo or watermark
Everything else is fine: products, racks, the shop, the counter, the owner, adult customers wearing clothes, flat lays, mirror selfies.
Reply with JSON only: {"photos":[{"i":number,"ok":boolean,"why":"short reason the owner will read, only when not ok"}]}`;

export async function checkPhotos(paths: string[]): Promise<{ kept: string[]; rejected: { path: string; why: string }[] }> {
  const { supabase, user } = await ensureBusiness();
  const mine = z.array(z.string().min(1)).max(30).parse(paths).filter((p) => p.startsWith(`${user.id}/`));
  const key = claudeKey();
  if (!mine.length || !key) return { kept: mine, rejected: [] };

  const { data: signed } = await supabase.storage.from("clips").createSignedUrls(mine, 600);
  const content: Anthropic.ContentBlockParam[] = [];
  mine.forEach((p, i) => {
    const url = signed?.[i]?.signedUrl;
    if (!url) return;
    content.push({ type: "text", text: `Photo ${i}:` });
    content.push({ type: "image", source: { type: "url", url } });
  });
  if (!content.length) return { kept: mine, rejected: [] };

  try {
    const client = new Anthropic({ apiKey: key, timeout: 30_000, maxRetries: 1 });
    const res = await client.messages.create({ model: "claude-haiku-5-5", max_tokens: 600, system: RULES, messages: [{ role: "user", content }] });
    const text = res.content.map((b) => (b.type === "text" ? b.text : "")).join("");
    const json = JSON.parse(text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1));
    const verdicts = z.object({ photos: z.array(z.object({ i: z.number().int(), ok: z.boolean(), why: z.string().optional() })) }).parse(json).photos;
    const bad = verdicts.filter((v) => !v.ok && mine[v.i]).map((v) => ({ path: mine[v.i], why: (v.why || "It doesn't look usable for a post.").slice(0, 160) }));
    if (bad.length) await supabase.storage.from("clips").remove(bad.map((b) => b.path));
    return { kept: mine.filter((p) => !bad.some((b) => b.path === p)), rejected: bad };
  } catch (e) {
    console.error("photo check skipped", e);
    return { kept: mine, rejected: [] };
  }
}
