import { z } from "zod";

// Shape of the six Store Grader answers, checked on the server before anything is saved.
export const answersSchema = z.object({
  store: z.string().trim().min(1).max(80),
  instagram: z.string().max(60),
  posts: z.string().max(40),
  sale: z.string().max(12),
  reviews: z.string().max(10),
  track: z.string().max(40),
});

// Jackson's rule: at least 8 characters and at least one number.
export const passwordSchema = z
  .string()
  .min(8, "Use at least 8 characters.")
  .regex(/\d/, "Add at least one number.");

export const emailSchema = z.string().trim().toLowerCase().email("That doesn't look like an email.");
