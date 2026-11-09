export const CATEGORIES = ["Baby", "Food", "Clothing", "Household", "School", "Hygiene", "Other"] as const;
export type Category = (typeof CATEGORIES)[number];

// Category colors live in globals.css as --cat-* tokens.
// The class names are written out in full so Tailwind can find them.
// `fill-*` is there because the fish logo on the band inherits it.
export const CATEGORY_TONE: Record<Category, string> = {
  Baby: "bg-cat-baby fill-cat-baby",
  Food: "bg-cat-food fill-cat-food",
  Clothing: "bg-cat-clothing fill-cat-clothing",
  Household: "bg-cat-household fill-cat-household",
  School: "bg-cat-school fill-cat-school",
  Hygiene: "bg-cat-hygiene fill-cat-hygiene",
  Other: "bg-cat-other fill-cat-other",
};
