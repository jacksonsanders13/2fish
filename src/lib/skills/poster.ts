import { z } from "zod";

// The poster kit. The poster specialist picks a layout, a palette and the words;
// the poster route draws it at Instagram's 4:5 size (1080 x 1350). Solid colors
// only, one headline face, real product photos. No gradients, no stock art.

export const POSTER_SIZE = { width: 1080, height: 1350 } as const;

export const PALETTES = {
  coral: { bg: "#c8402f", fg: "#ffffff", accent: "#ffd9cf" },
  teal: { bg: "#176b69", fg: "#ffffff", accent: "#bfe6e2" },
  ink: { bg: "#0f1f20", fg: "#ffffff", accent: "#f2c14e" },
  sun: { bg: "#f2c14e", fg: "#0f1f20", accent: "#8a2a1c" },
  white: { bg: "#ffffff", fg: "#0f1f20", accent: "#c8402f" },
  rose: { bg: "#f4d6d0", fg: "#4a1710", accent: "#c8402f" },
  forest: { bg: "#1f4d3a", fg: "#ffffff", accent: "#f2c14e" },
  sky: { bg: "#d7e9f2", fg: "#10324a", accent: "#c8402f" },
} as const;
export type PaletteName = keyof typeof PALETTES;

export const LAYOUTS = {
  photo: "The product photo fills the top two thirds; a solid color band below holds the words. Best when there's a strong product photo.",
  split: "Photo on the left half, words on the right half. Good for one item with a short headline.",
  type: "No photo. A huge headline on a solid color. Best for sale announcements, events, hours and holiday notices.",
} as const;
export type LayoutName = keyof typeof LAYOUTS;

export const posterSpec = z.object({
  layout: z.enum(Object.keys(LAYOUTS) as [LayoutName, ...LayoutName[]]),
  palette: z.enum(Object.keys(PALETTES) as [PaletteName, ...PaletteName[]]),
  headline: z.string().trim().min(1).max(48),
  subline: z.string().trim().max(90).default(""),
  details: z.string().trim().max(60).default(""),
  photo: z.number().int().min(0).nullable().default(null),
  caption: z.string().trim().max(900).default(""),
});
export type PosterSpec = z.infer<typeof posterSpec>;

/** What the specialist is told about the kit, alongside its design skills. */
export const POSTER_KIT = `
THE POSTER KIT (you can only use these)
Size: 1080 x 1350, Instagram 4:5. Fonts are fixed: Calistoga for the headline, IBM Plex Sans for everything else.
Layouts:
${Object.entries(LAYOUTS)
  .map(([k, v]) => `- ${k}: ${v}`)
  .join("\n")}
Palettes (background / text / accent):
${Object.entries(PALETTES)
  .map(([k, v]) => `- ${k}: ${v.bg} / ${v.fg} / ${v.accent}`)
  .join("\n")}

Rules for the words
- headline: 2 to 6 words, the one thing to know ("Winter sale, 20% off" or "The fig candle is back"). Max 48 characters. No period at the end.
- subline: one short line that adds a fact (what's included, who it's for). Max 90 characters. Can be empty.
- details: when and where ("Sat Dec 13, 10 to 6 · 412 Glenwood Ave"). Max 60 characters. Only facts the owner gave.
- Never invent prices, discounts, dates, hours or addresses. If one is missing, leave it out.
- Pick the palette that fits the store and the moment (sale: coral or sun; calm new arrival: white, rose or sky; evening event: ink or forest). Avoid the same palette as a poster you were told the store just made.
- photo: index of the best file from the list, or null. Use layout "type" when photo is null.
- caption: the Instagram caption to post with it, following the caption rules.

Reply with JSON only: {"layout":string,"palette":string,"headline":string,"subline":string,"details":string,"photo":number|null,"caption":string}
`.trim();
