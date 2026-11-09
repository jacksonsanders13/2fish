export const CATEGORIES = ["Baby", "Food", "Clothing", "Household", "School", "Hygiene", "Other"] as const;
export type Category = (typeof CATEGORIES)[number];
