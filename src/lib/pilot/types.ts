// Shapes for the pilot tools. Client-safe.

export const POST_KINDS = ["try-on", "new arrival", "behind the scenes", "outfit", "gift idea", "in the shop", "sale"] as const;

export const SOURCES = [
  { id: "post", label: "Saw a post" },
  { id: "google", label: "Google" },
  { id: "walked-by", label: "Walked by" },
  { id: "friend", label: "A friend" },
  { id: "regular", label: "Regular" },
  { id: "other", label: "Other" },
] as const;
export type SourceId = (typeof SOURCES)[number]["id"];

export type Post = {
  id: string;
  weekOf: string;
  position: number;
  day: string;
  kind: string;
  title: string;
  hook: string;
  caption: string;
  items: string[];
  mediaPath: string | null;
  mediaUrl: string | null;
  isImage: boolean;
  status: "draft" | "approved" | "posted";
};

export type Upload = { path: string; name: string; url: string | null; isImage: boolean };

export type Checkout = { id: string; source: SourceId; amount: number; postId: string | null; soldOn: string; createdAt: string };

export type WeekSales = { weekOf: string; amount: number };

export type ItemSale = { weekOf: string; item: string; sold: number; soldBefore: number };

const IMAGE_EXT = /\.(jpe?g|png|webp|gif|heic|heif)$/i;
export function looksLikeImage(name: string) {
  return IMAGE_EXT.test(name);
}

export function sourceLabel(id: string) {
  return SOURCES.find((s) => s.id === id)?.label ?? "Other";
}
