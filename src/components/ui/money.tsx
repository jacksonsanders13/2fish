import { cn, money } from "@/lib/utils";

type Tone = "cash" | "cash-bright" | "ink" | "white";

const tones: Record<Tone, string> = {
  cash: "text-cash",
  "cash-bright": "text-cash-bright",
  ink: "text-ink",
  white: "text-white",
};

// Gains are green. Losses are navy. Every figure is tabular.
export function Money({
  amount,
  per,
  sign,
  tone = "cash",
  className,
}: {
  amount: number;
  per?: string;
  sign?: "+" | "-";
  tone?: Tone;
  className?: string;
}) {
  return (
    <span className={cn("num", tones[tone], className)}>
      {sign}
      {money(amount)}
      {per ? <span className="text-[0.62em] font-normal opacity-80">{per}</span> : null}
    </span>
  );
}
