"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { ease } from "./reveal";

// A plain integer that counts up the first time it's seen.
export function Count({
  to,
  duration = 1,
  delay = 0,
  className,
}: {
  to: number;
  duration?: number;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (!inView || reduce) return;
    const controls = animate(0, to, { duration, ease, delay, onUpdate: (v) => setShown(Math.round(v)) });
    return () => controls.stop();
  }, [inView, reduce, to, duration, delay]);

  return (
    <span ref={ref} className={cn("num", className)}>
      {inView && !reduce ? shown : to}
    </span>
  );
}
