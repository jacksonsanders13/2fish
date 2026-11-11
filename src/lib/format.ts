// Small helpers used around the app.

export const zipOk = (z: string) => /^\d{5}$/.test(z);

export const digitsOnly = (s: string, max = 5) => s.replace(/\D/g, "").slice(0, max);

// only allow real web links, never javascript: or anything weird
export function safeUrl(u: string | null | undefined): string | null {
  if (!u) return null;
  try {
    const x = new URL(u);
    return x.protocol === "https:" || x.protocol === "http:" ? x.href : null;
  } catch {
    return null;
  }
}

// catches stuff like "123 Oak St" so nobody posts their home address in public
export const looksLikeAddress = (text: string) =>
  /\b\d{1,6}\s+(?:[A-Za-z]+\s){0,3}(st|street|rd|road|ave|avenue|dr|drive|ln|lane|ct|court|blvd|boulevard|way|pl|place|cir|circle|ter|terrace|pkwy|parkway|hwy|highway)\b\.?/i.test(
    text,
  );

export function timeAgo(input: string | number | Date) {
  const ms = Date.now() - new Date(input).getTime();
  const m = Math.round(ms / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  if (d < 7) return `${d}d ago`;
  const w = Math.round(d / 7);
  if (w < 5) return `${w}w ago`;
  return new Date(input).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function formatDistance(miles: number | null | undefined) {
  if (miles == null || Number.isNaN(miles)) return null;
  if (miles < 1) return "under 1 mi away";
  return `~${Math.round(miles)} mi away`;
}

export function initials(name: string | null | undefined) {
  const n = (name ?? "").trim();
  if (!n) return "?";
  return n
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export function pluralize(n: number, one: string, many = one + "s") {
  return `${n} ${n === 1 ? one : many}`;
}

export function truncate(s: string, max: number) {
  return s.length > max ? s.slice(0, max - 1).trimEnd() + "…" : s;
}
