import type { Category } from "./categories";

export type Status = "open" | "pledged" | "done";
export type HelpMethod = "inperson" | "wishlist";
export type Range = "zip" | "area" | "all";

// Field names line up with the `needs` table we'll make in Supabase.
export interface Need {
  id: string;
  posterId: string;
  title: string;
  category: Category;
  story: string;
  zip: string;
  area: string;
  displayName: string;
  neededBy: string; // "YYYY-MM-DD" or ""
  inPerson: boolean;
  meetSpot: string;
  wishlistUrl: string;
  status: Status;
  helper?: { id: string; method: HelpMethod; note: string };
  createdAt: number;
  example?: boolean;
}
