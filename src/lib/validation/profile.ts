import { z } from "zod";
import { looksLikeAddress } from "@/lib/format";

const noAddress = (label: string) => (v: string) =>
  !looksLikeAddress(v) || { message: `Please don't put a street address in your ${label}.` };

export const zipSchema = z
  .string()
  .trim()
  .regex(/^\d{5}$/, "Enter a 5-digit ZIP code.");

export const profileSchema = z.object({
  displayName: z.string().trim().min(1, "Tell us what to call you.").max(40, "Keep it under 40 characters."),
  area: z
    .string()
    .trim()
    .max(60, "Keep it under 60 characters.")
    .refine((v) => !looksLikeAddress(v), "Use a neighborhood or city, not a street address.")
    .optional()
    .or(z.literal("")),
  bio: z
    .string()
    .trim()
    .max(280, "Keep it under 280 characters.")
    .refine((v) => !looksLikeAddress(v), "Please don't put a street address in your bio.")
    .optional()
    .or(z.literal("")),
  zip: zipSchema,
});

export const onboardingSchema = profileSchema.pick({ displayName: true, area: true, zip: true }).extend({
  // present only when the person hasn't accepted yet (e.g. first Google sign-in)
  over18: z.literal("on").optional(),
});

export { noAddress };
