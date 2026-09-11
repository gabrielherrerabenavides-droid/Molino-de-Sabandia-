"use client";

import { clsx } from "clsx";
import { motion, useReducedMotion } from "motion/react";

/**
 * Motivo del agua (DESIGN.md §6.5): línea vertical fina con guiones
 * animados muy lentamente. Decorativa: siempre oculta a lectores de pantalla.
 */
export function WaterLine({ className, tone = "agua" }: { className?: string; tone?: "agua" | "light" }) {
  const reduced = useReducedMotion();
  const stroke = tone === "light" ? "rgba(201,165,104,0.55)" : "var(--color-agua-500)";

  return (
    <div aria-hidden="true" className={clsx("pointer-events-none flex justify-center", className)}>
      <svg viewBox="0 0 12 200" preserveAspectRatio="none" fill="none" className="h-full w-3">
        <path d="M6 0C3 40 9 80 6 120C3 160 9 180 6 200" stroke={stroke} strokeOpacity="0.3" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        <motion.path
          d="M6 0C3 40 9 80 6 120C3 160 9 180 6 200"
          vectorEffect="non-scaling-stroke"
          stroke={stroke}
          strokeWidth="1.4"
          strokeDasharray="14 200"
          initial={{ strokeDashoffset: 0 }}
          animate={reduced ? { strokeDashoffset: 0 } : { strokeDashoffset: -214 }}
          transition={reduced ? { duration: 0 } : { duration: 11, repeat: Infinity, ease: "linear" }}
        />
      </svg>
    </div>
  );
}
