export const CATEGORIES = ["Baby", "Food", "Clothing", "Household", "School", "Hygiene", "Other"] as const;
export type Category = (typeof CATEGORIES)[number];

export const CAT_COLOR: Record<Category, string> = {
  Baby: "#2f7de1",
  Food: "#e07a1f",
  Clothing: "#8a4fd6",
  Household: "#2a9d8f",
  School: "#d64570",
  Hygiene: "#1fa2c9",
  Other: "#5b6b7a",
};

export const AVATAR_COLORS = ["#1b5fd1", "#12a05c", "#e07a1f", "#8a4fd6", "#d64570", "#2a9d8f", "#c2410c", "#0e7490"];
