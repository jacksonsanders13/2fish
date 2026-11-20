"use client";

import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { ease } from "./reveal";

// A bar that grows to its width the first time it scrolls into view.
export function GrowBar({
  pct,
  delay = 0.2,
  duration = 0.9,
  className,
  barClassName,
}: {
  pct: number;
  delay?: number;
  duration?: number;
  className?: string;
  barClassName?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-line", className)} aria-hidden="true">
      <motion.div
        className={cn("h-full rounded-full bg-night", barClassName)}
        initial={{ width: reduce ? `${pct}%` : 0 }}
        whileInView={{ width: `${pct}%` }}
        viewport={{ once: true }}
        transition={{ duration: reduce ? 0 : duration, ease, delay }}
      />
    </div>
  );
}
