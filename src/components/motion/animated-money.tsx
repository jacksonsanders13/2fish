"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView, useReducedMotion } from "motion/react";
import { Money } from "@/components/ui/money";
import { ease } from "./reveal";

type Props = React.ComponentProps<typeof Money> & { duration?: number };

// Counts up to the amount the first time it scrolls into view, and tweens
// between values after that (the calculator uses this).
export function AnimatedMoney({ amount, duration = 1, ...rest }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(0);
  const from = useRef(0);

  useEffect(() => {
    if (!inView || reduce) return;
    const controls = animate(from.current, amount, {
      duration,
      ease,
      onUpdate: (v) => setShown(Math.round(v)),
    });
    from.current = amount;
    return () => controls.stop();
  }, [amount, inView, reduce, duration]);

  return (
    <span ref={ref} className="inline-block">
      <Money amount={inView && !reduce ? shown : amount} {...rest} />
    </span>
  );
}
