"use client";

import { motion, useReducedMotion } from "motion/react";

export const ease = [0.21, 0.47, 0.32, 0.98] as const;

type Tag = "div" | "li" | "section" | "span" | "p";

type Props = {
  children: React.ReactNode;
  className?: string;
  /** Seconds to wait before starting. Use steps of 0.08 to 0.12 to stagger siblings. */
  delay?: number;
  /** Pixels to rise from. */
  y?: number;
  /** Pixels to slide in from (positive = from the right). */
  x?: number;
  duration?: number;
  /** Animate on mount instead of when scrolled into view. For above-the-fold content. */
  immediate?: boolean;
  as?: Tag;
};

// Fade-and-rise, once. Under Reduce Motion it still fades, it just doesn't move.
export function Reveal({
  children,
  className,
  delay = 0,
  y = 28,
  x = 0,
  duration = 0.7,
  immediate = false,
  as = "div",
}: Props) {
  const reduce = useReducedMotion();
  const Comp = motion[as];

  const from = reduce ? { opacity: 0 } : { opacity: 0, y, x };
  const to = {
    opacity: 1,
    y: 0,
    x: 0,
    transition: { duration: reduce ? 0.3 : duration, ease, delay: reduce ? 0 : delay },
  };

  if (immediate) {
    return (
      <Comp className={className} initial={from} animate={to}>
        {children}
      </Comp>
    );
  }

  return (
    <Comp className={className} initial={from} whileInView={to} viewport={{ once: true, margin: "0px 0px -10% 0px" }}>
      {children}
    </Comp>
  );
}
