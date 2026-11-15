"use client";

import { useRef } from "react";
import { useInView } from "motion/react";
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

// A dollar figure that rolls up on a spring the first time it's seen.
// Cult UI's RollingNumber does the rolling; this just adds the money format,
// the tone rules (green only for gains) and the "start when visible" part.
export function RollingMoney({ amount, tone = "cash", className }: { amount: number; tone?: Tone; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const value = inView ? amount : 0;

  return (
    <span ref={ref} className={cn("num inline-block", tones[tone], className)}>
      <RollingNumber value={value} format={money} />
    </span>
  );
}
