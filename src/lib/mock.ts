import { isoInDays } from "./format";
import type { Need } from "./types";

// Fake data until Supabase is hooked up (Milestone 2).
// "me" stands in for whoever is logged in.
export const ME = "me";

export function exampleNeeds(): Need[] {
  const now = Date.now();
  const hour = 3600e3;
  return [
    {
      id: "p1", posterId: "x1", example: true, status: "open", createdAt: now - 3 * hour,
      title: "Size 4 diapers", category: "Baby",
      story: "Single mom of two. Any brand works, a box or two would get us through the month.",
      zip: "27615", area: "North Raleigh", displayName: "Jess", neededBy: isoInDays(2),
      inPerson: true, meetSpot: "North Regional Library lobby", wishlistUrl: "",
    },
    {
      id: "p2", posterId: "x2", example: true, status: "pledged", createdAt: now - 26 * hour,
      title: "Winter coat, boys 10/12", category: "Clothing",
      story: "My son outgrew his coat. Gently used is great.",
      zip: "27609", area: "Midtown", displayName: "Marcus", neededBy: isoInDays(6),
      inPerson: true, meetSpot: "Church lobby on Six Forks", wishlistUrl: "https://www.amazon.com/hz/wishlist/ls/EXAMPLE",
      helper: { id: "x9", method: "wishlist", note: "Ordered, arriving Thursday" },
    },
    {
      id: "p3", posterId: "x3", example: true, status: "open", createdAt: now - 50 * 60e3,
      title: "Groceries for the week", category: "Food",
      story: "Between paychecks. Canned goods, rice, peanut butter.",
      zip: "27604", area: "", displayName: "", neededBy: isoInDays(1),
      inPerson: true, meetSpot: "Food Lion parking lot, Capital Blvd", wishlistUrl: "",
    },
    {
      id: "p4", posterId: "x4", example: true, status: "done", createdAt: now - 96 * hour,
      title: "School supplies for 3rd grade", category: "School",
      story: "Pencils, glue sticks, a backpack if anyone has one.",
      zip: "27616", area: "Brier Creek", displayName: "Ana", neededBy: "",
      inPerson: false, meetSpot: "", wishlistUrl: "https://www.amazon.com/hz/wishlist/ls/EXAMPLE2",
      helper: { id: "x8", method: "wishlist", note: "" },
    },
  ];
}
