"use client";

import { motion } from "motion/react";
import { EASE } from "@/components/ui/Reveal";

/**
 * Transición entre páginas (DESIGN.md §5). El header vive en el layout, así que
 * no parpadea. `prefers-reduced-motion` se respeta vía `MotionConfig` en `Providers`.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}
