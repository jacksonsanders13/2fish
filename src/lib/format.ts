// Small helpers used around the app.

export const zipOk = (z: string) => /^\d{5}$/.test(z);

export const digitsOnly = (s: string, max = 5) => s.replace(/\D/g, "").slice(0, max);

// only allow real web links, never javascript: or anything weird
export function safeUrl(u: string): string | null {
  try {
    const x = new URL(u);
    return x.protocol === "https:" || x.protocol === "http:" ? x.href : null;
  } catch {
    return null;
  }
}

// catches stuff like "123 Oak St" so nobody posts their home address
export const looksLikeAddress = (text: string) =>
  /\d+\s+\w+\s+(st|street|rd|road|ave|avenue|dr|drive|ln|lane|ct|court|blvd)\b/i.test(text);

function today() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export function isoInDays(n: number) {
  const d = today();
  d.setDate(d.getDate() + n);
  const pad = (x: number) => String(x).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function daysUntil(iso: string) {
  if (!iso) return null;
  return Math.round((new Date(iso + "T00:00:00").getTime() - today().getTime()) / 86400000);
}

export const fmtDate = (iso: string) =>
  new Date(iso + "T00:00:00").toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });

export function dueLabel(iso: string) {
  const d = daysUntil(iso);
  if (d === null) return "";
  if (d < 0) return "Past due";
  if (d === 0) return "Needed today";
  if (d === 1) return "Needed tomorrow";
  return "By " + fmtDate(iso);
}

export function timeAgo(ms: number) {
  const m = Math.round((Date.now() - ms) / 60000);
  if (m < 60) return m <= 1 ? "just now" : m + "m";
  const h = Math.round(m / 60);
  if (h < 24) return h + "h";
  return Math.round(h / 24) + "d";
}

export function hash(s: string) {
  let h = 0;
  for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) | 0;
  return Math.abs(h);
}
