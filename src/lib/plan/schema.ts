import { z } from "zod";

// Shape of the nine audit answers, checked on the server before anything is saved.
export const answersSchema = z.object({
  type: z.string().min(1).max(40),
  calls: z.string().max(10),
  missed: z.string().max(60),
  job: z.string().max(12),
  reviews: z.string().max(10),
  ask: z.string().max(20),
  social: z.string().max(40),
  winback: z.string().max(20),
  headache: z.string().max(600),
});

// Jackson's rule: at least 8 characters and at least one number.
export const passwordSchema = z
  .string()
  .min(8, "Use at least 8 characters.")
  .regex(/\d/, "Add at least one number.");

export const emailSchema = z.string().trim().toLowerCase().email("That doesn't look like an email.");
