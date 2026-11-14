import { z } from "zod";
import { CATEGORIES, FULFILLMENTS, URGENCIES } from "@/lib/needs/constants";
import { looksLikeAddress, safeUrl } from "@/lib/format";
import { checkText } from "@/lib/moderation";

export const needSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(3, "Give it a short, specific title.")
      .max(80, "Keep the title under 80 characters.")
      .refine((v) => !looksLikeAddress(v), "Please don't put a street address in the title.")
      .superRefine((v, ctx) => {
        const problem = checkText(v, "title");
        if (problem) ctx.addIssue({ code: "custom", message: problem });
      }),
    description: z
      .string()
      .trim()
      .min(10, "Add a sentence or two so a neighbor knows exactly what helps.")
      .max(1000, "Keep it under 1,000 characters.")
      .refine((v) => !looksLikeAddress(v), "Please don't put a street address here. Share meeting spots privately in messages.")
      .superRefine((v, ctx) => {
        const problem = checkText(v, "description");
        if (problem) ctx.addIssue({ code: "custom", message: problem });
      }),
    category: z.enum(CATEGORIES, { error: "Pick a category." }),
    urgency: z.enum(URGENCIES, { error: "Pick how soon." }),
    fulfillment: z.enum(FULFILLMENTS, { error: "Pick how you'd like to receive it." }),
    wishlistUrl: z.string().trim().max(500).optional().or(z.literal("")),
  })
  .superRefine((v, ctx) => {
    const wantsWishlist = v.fulfillment === "wishlist" || v.fulfillment === "both";
    if (wantsWishlist) {
      if (!v.wishlistUrl) {
        ctx.addIssue({ code: "custom", path: ["wishlistUrl"], message: "Paste the wishlist link, starting with https://" });
      } else if (!safeUrl(v.wishlistUrl)) {
        ctx.addIssue({ code: "custom", path: ["wishlistUrl"], message: "That link doesn't look right. It should start with https://" });
      }
    }
  });

export type NeedInput = z.infer<typeof needSchema>;

export const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
export const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

export const reportSchema = z.object({
  targetType: z.enum(["need", "profile", "message"]),
  targetId: z.uuid(),
  reason: z.enum(["spam", "scam", "address", "harassment", "inappropriate", "other"], { error: "Pick a reason." }),
  details: z.string().trim().max(1000, "Keep it under 1,000 characters.").optional().or(z.literal("")),
});

export const REPORT_REASONS: Record<z.infer<typeof reportSchema>["reason"], string> = {
  spam: "Spam or not a real need",
  scam: "Asking for money or a scam",
  address: "Shares an address or private info",
  harassment: "Harassment or threats",
  inappropriate: "Inappropriate content",
  other: "Something else",
};

export const messageSchema = z.object({
  threadId: z.uuid(),
  body: z
    .string()
    .trim()
    .min(1, "Write something first.")
    .max(2000, "Keep it under 2,000 characters.")
    .superRefine((v, ctx) => {
      const problem = checkText(v, "message");
      if (problem) ctx.addIssue({ code: "custom", message: problem });
    }),
});
