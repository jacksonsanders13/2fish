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
