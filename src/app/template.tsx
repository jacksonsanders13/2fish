"use client";

import { motion } from "motion/react";

// Re-mounts on every navigation, so each screen fades in. Opacity only, so
// fixed and sticky bars inside aren't affected by a transform.
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35, ease: "easeOut" }}>
      {children}
    </motion.div>
  );
}
