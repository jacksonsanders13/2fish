"use client";

import { motion, useReducedMotion } from "motion/react";
import { ease } from "./reveal";

// A headline whose words rise in one after another.
export function SplitWords({
  text,
  className,
  delay = 0,
  stagger = 0.05,
}: {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
}) {
  const reduce = useReducedMotion();

  if (reduce) {
    return (
      <motion.span className={className} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
        {text}
      </motion.span>
    );
  }

  const words = text.split(" ");
  return (
    <span className={className} aria-label={text}>
      {words.map((word, i) => (
        <span key={`${word}-${i}`} aria-hidden="true">
          <motion.span
            className="inline-block"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease, delay: delay + i * stagger }}
          >
            {word}
          </motion.span>
          {i < words.length - 1 ? " " : null}
        </span>
      ))}
    </span>
  );
}
