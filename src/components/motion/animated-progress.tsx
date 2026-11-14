"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "motion/react";
import { Progress } from "@/components/ui/progress";

// A progress bar that fills from zero when it scrolls into view.
export function AnimatedProgress({
  value,
  delay = 0,
  className,
  ...rest
}: React.ComponentProps<typeof Progress> & { value: number; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (!inView || reduce) return;
    const t = window.setTimeout(() => setShown(value), delay * 1000);
    return () => window.clearTimeout(t);
  }, [inView, value, delay, reduce]);

  return (
    <div ref={ref}>
      <Progress value={reduce ? value : shown} className={className} {...rest} />
    </div>
  );
}
