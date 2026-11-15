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
