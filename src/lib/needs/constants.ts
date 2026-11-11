import {
  Baby,
  GraduationCap,
  HeartPulse,
  Home,
  Package,
  Shirt,
  ShoppingBasket,
  type LucideIcon,
} from "lucide-react";

export const CATEGORIES = ["baby", "food", "clothing", "household", "school", "medical", "other"] as const;
export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_META: Record<Category, { label: string; icon: LucideIcon; hint: string }> = {
  baby: { label: "Baby", icon: Baby, hint: "Diapers, formula, wipes, clothes" },
  food: { label: "Food", icon: ShoppingBasket, hint: "Groceries, pantry staples" },
  clothing: { label: "Clothing", icon: Shirt, hint: "Coats, shoes, work clothes" },
  household: { label: "Household", icon: Home, hint: "Bedding, cleaning supplies, small appliances" },
  school: { label: "School", icon: GraduationCap, hint: "Supplies, backpacks, uniforms" },
  medical: { label: "Medical supplies", icon: HeartPulse, hint: "Over-the-counter items, mobility aids" },
  other: { label: "Other", icon: Package, hint: "Anything else specific" },
};

export const URGENCIES = ["low", "normal", "high"] as const;
export type Urgency = (typeof URGENCIES)[number];
export const URGENCY_META: Record<Urgency, { label: string; hint: string }> = {
  low: { label: "Whenever", hint: "No rush, within a few weeks" },
  normal: { label: "This week", hint: "Would help in the next 7 days" },
  high: { label: "Urgent", hint: "Needed in the next day or two" },
};

export const STATUSES = ["open", "pledged", "fulfilled", "closed"] as const;
export type Status = (typeof STATUSES)[number];
export const STATUS_META: Record<Status, { label: string }> = {
  open: { label: "Open" },
  pledged: { label: "Help on the way" },
  fulfilled: { label: "Fulfilled" },
  closed: { label: "Closed" },
};

export const FULFILLMENTS = ["in_person", "wishlist", "both"] as const;
export type Fulfillment = (typeof FULFILLMENTS)[number];
export const FULFILLMENT_META: Record<Fulfillment, { label: string; hint: string }> = {
  in_person: { label: "Drop-off", hint: "Meet at a public place you agree on in messages" },
  wishlist: { label: "Wishlist", hint: "A neighbor buys it and the store ships it to you" },
  both: { label: "Drop-off or wishlist", hint: "Either way works" },
};

export const RADIUS_OPTIONS = [2, 5, 10, 25, 50] as const;
export const DEFAULT_RADIUS = 10;
