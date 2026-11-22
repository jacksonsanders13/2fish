// Dates as plain "YYYY-MM-DD" strings in the store's time zone. Weeks start on Monday.

export function todayIn(tz: string) {
  try {
    return new Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(new Date());
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}

function asDate(ymd: string) {
  return new Date(`${ymd}T12:00:00Z`);
}

export function addDays(ymd: string, n: number) {
  const d = asDate(ymd);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export function mondayOf(ymd: string) {
  const dow = asDate(ymd).getUTCDay();
  return addDays(ymd, -((dow + 6) % 7));
}

/** The Monday a new pack is for: today if it's Monday, otherwise the next one. */
export function packWeek(today: string) {
  const m = mondayOf(today);
  return m === today ? m : addDays(m, 7);
}

export function isYmd(v: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(asDate(v).getTime());
}

export function shortDate(ymd: string) {
  return asDate(ymd).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
}

export function monthName(ym: string) {
  return asDate(`${ym}-01`).toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });
}

export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
