import { Apple, Baby, Backpack, Droplets, LayoutGrid, Package, Shirt, Sofa, type LucideIcon } from "lucide-react";
import type { Category } from "@/lib/categories";

// Each category's icon and color. Colors are the --cat-* tokens; class
// names are written out in full so Tailwind can find them.
export const CATEGORY_META: Record<Category | "All", { icon: LucideIcon; dot: string; text: string }> = {
  All: { icon: LayoutGrid, dot: "bg-primary", text: "text-primary" },
  Baby: { icon: Baby, dot: "bg-cat-baby", text: "text-cat-baby" },
  Food: { icon: Apple, dot: "bg-cat-food", text: "text-cat-food" },
  Clothing: { icon: Shirt, dot: "bg-cat-clothing", text: "text-cat-clothing" },
  Household: { icon: Sofa, dot: "bg-cat-household", text: "text-cat-household" },
  School: { icon: Backpack, dot: "bg-cat-school", text: "text-cat-school" },
  Hygiene: { icon: Droplets, dot: "bg-cat-hygiene", text: "text-cat-hygiene" },
  Other: { icon: Package, dot: "bg-cat-other", text: "text-cat-other" },
};

// Small "● Food" label used on posts.
export function CategoryTag({ category }: { category: Category }) {
  const { icon: Icon, text } = CATEGORY_META[category];
  return (
    <span className={`inline-flex items-center gap-1 text-sm font-bold ${text}`}>
      <Icon aria-hidden="true" className="size-4" />
      {category}
    </span>
  );
}
