// Shapes shared by the app screens and the server code. Client-safe: no
// Supabase imports here.

export type Business = {
  id: string;
  name: string;
  kind: string;
  phone: string;
  city: string;
  timezone: string;
};

export type Customer = {
  id: string;
  name: string;
  phone: string;
  email: string;
  lastJobAt: string | null;
  lastJobValue: number | null;
  smsConsent: boolean;
  source: string;
  createdAt: string;
};

export type Job = {
  id: string;
  customerId: string | null;
  value: number;
  wonAt: string;
  sourceStep: string | null;
  note: string;
};

export type Message = {
  id: string;
  phone: string;
  direction: "in" | "out" | "missed-call";
  body: string;
  status: string;
  createdAt: string;
};

export type Conversation = {
  phone: string;
  customerName: string | null;
  customerId: string | null;
  last: Message;
  messages: Message[];
};

export type TextbackSettings = {
  enabled: boolean;
  forwardNumber: string;
  template: string;
  hoursStart: number;
  hoursEnd: number;
  delaySeconds: number;
};

export type AppEvent = {
  id: string;
  kind: string;
  text: string;
  createdAt: string;
};

export const STEP_SOURCES = [
  { key: "text-back", label: "Missed-call text-back" },
  { key: "reviews", label: "Review request" },
  { key: "winback", label: "Past-customer reminder" },
  { key: "videos", label: "Videos" },
  { key: "other", label: "Something else" },
] as const;

// The kinds of shop 2fish is for: independent shops that sell products in person.
// The label is what the owner picks; the id tags post examples so Fisher learns
// from shops like theirs.
export const SHOP_TYPES = [
  { id: "boutique", label: "Clothing boutique" },
  { id: "gift", label: "Gift or home shop" },
  { id: "plants", label: "Plant or flower shop" },
  { id: "jewelry", label: "Jewelry or accessories" },
  { id: "books", label: "Bookstore" },
  { id: "any", label: "Other shop" },
] as const;
export type ShopTypeId = (typeof SHOP_TYPES)[number]["id"];
export const BUSINESS_KINDS: string[] = SHOP_TYPES.map((t) => t.label);

/** Which example set a store's type maps to. Older rows said "Boutique" or "Store". */
export function shopTypeOf(kind: string | null | undefined): ShopTypeId {
  const k = (kind ?? "").toLowerCase();
  const hit = SHOP_TYPES.find((t) => t.label.toLowerCase() === k);
  if (hit) return hit.id;
  if (k.includes("boutique") || k.includes("clothing")) return "boutique";
  return "any";
}

/** Digits only, with a US country code when it looks like a 10-digit number. */
export function normalizePhone(input: string) {
  const digits = input.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return digits ? `+${digits}` : "";
}

export function formatPhone(e164: string) {
  const d = e164.replace(/\D/g, "");
  if (d.length === 11 && d.startsWith("1")) return `(${d.slice(1, 4)}) ${d.slice(4, 7)}-${d.slice(7)}`;
  return e164;
}

export function hourLabel(h: number) {
  const suffix = h >= 12 ? "PM" : "AM";
  const twelve = h % 12 === 0 ? 12 : h % 12;
  return `${twelve}:00 ${suffix}`;
}

export function defaultTemplate(businessName: string) {
  const intro = businessName ? `Hi, this is ${businessName}. Sorry I missed your call,` : "Hi, sorry I missed your call,";
  return `${intro} I'm on a job. What can I help with? Reply here or I'll call you back within the hour.`;
}
