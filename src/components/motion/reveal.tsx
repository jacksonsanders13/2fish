"use client";

import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";

// Fade-and-rise on scroll. Respects reduced-motion.
export function Reveal({
  delay = 0,
  y = 16,
  once = true,
  ...props
}: HTMLMotionProps<"div"> & { delay?: number; y?: number; once?: boolean }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: "-10% 0px" }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay }}
      {...props}
    />
  );
}
