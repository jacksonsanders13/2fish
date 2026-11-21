"use client";

import { useReducedMotion } from "motion/react";
import { RollingNumber } from "@/components/ui/rolling-number";
import { money } from "@/lib/format";
import { cn } from "@/lib/utils";

type Tone = "cash" | "cash-bright" | "ink" | "white";
const tones: Record<Tone, string> = {
  cash: "text-cash",
  "cash-bright": "text-cash-bright",
  ink: "text-ink",
  white: "text-white",
};

// A dollar figure that rolls when it changes, say after a job gets logged.
// It shows the real amount from the first paint (never a $0 placeholder while
// JavaScript loads) and doesn't roll at all under Reduce Motion.
export function RollingMoney({ amount, tone = "cash", className }: { amount: number; tone?: Tone; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <span className={cn("num inline-block", tones[tone], className)}>
      {reduce ? money(amount) : <RollingNumber value={amount} format={money} />}
    </span>
  );
}
