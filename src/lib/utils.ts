export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export const DIRS = ["a", "b"] as const;
export type Dir = (typeof DIRS)[number];

export function isDir(value: string): value is Dir {
  return (DIRS as readonly string[]).includes(value);
}

export function money(amount: number) {
  return amount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

/** Round to the nearest ten so calculator output doesn't look falsely precise. */
export function roundTen(n: number) {
  return Math.round(n / 10) * 10;
}
