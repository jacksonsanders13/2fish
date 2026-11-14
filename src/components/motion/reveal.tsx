"use client";

import { motion, useReducedMotion } from "motion/react";

export const ease = [0.21, 0.47, 0.32, 0.98] as const;

type Tag = "div" | "li" | "section" | "span" | "p";

type Props = {
  children: React.ReactNode;
  className?: string;
  /** Seconds to wait before starting. Use small steps (0.06 to 0.1) to stagger siblings. */
  delay?: number;
  /** Pixels to rise from. */
  y?: number;
  /** Animate on mount instead of when scrolled into view. For above-the-fold content. */
  immediate?: boolean;
  as?: Tag;
};

// Fade-and-rise, once. The only scroll-linked motion on the site.
export function Reveal({ children, className, delay = 0, y = 14, immediate = false, as = "div" }: Props) {
  const reduce = useReducedMotion();
  const Comp = motion[as];

  if (reduce) {
    return <Comp className={className}>{children}</Comp>;
  }

  const visible = { opacity: 1, y: 0, transition: { duration: 0.55, ease, delay } };

  if (immediate) {
    return (
      <Comp className={className} initial={{ opacity: 0, y }} animate={visible}>
        {children}
      </Comp>
    );
  }

  return (
    <Comp
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={visible}
      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
    >
      {children}
    </Comp>
  );
}
