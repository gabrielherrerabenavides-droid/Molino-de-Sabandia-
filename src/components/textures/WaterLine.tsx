"use client";

import { useRef } from "react";
import { clsx } from "clsx";
import { motion, useInView, useReducedMotion } from "motion/react";

/**
 * Motivo del agua (DESIGN.md §6.5): línea vertical fina con guiones
 * animados muy lentamente. Decorativa: siempre oculta a lectores de pantalla.
 *
 * El bucle (stroke-dashoffset) se pinta en el hilo principal, así que solo corre
 * con la línea a la vista. Margen 0 a propósito: en la home empieza justo bajo
 * el pliegue y con margen positivo se animaría ya en la portada. Fuera de vista
 * vuelve al guion en 0, desde donde arranca al volver a entrar.
 */
export function WaterLine({ className, tone = "agua" }: { className?: string; tone?: "agua" | "light" }) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "0px" });
  const run = !reduced && inView;
  const stroke = tone === "light" ? "rgba(201,165,104,0.55)" : "var(--color-agua-500)";

  return (
    <div ref={ref} aria-hidden="true" className={clsx("pointer-events-none flex justify-center", className)}>
      <svg viewBox="0 0 12 200" preserveAspectRatio="none" fill="none" className="h-full w-3">
        <path d="M6 0C3 40 9 80 6 120C3 160 9 180 6 200" stroke={stroke} strokeOpacity="0.3" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        <motion.path
          d="M6 0C3 40 9 80 6 120C3 160 9 180 6 200"
          vectorEffect="non-scaling-stroke"
          stroke={stroke}
          strokeWidth="1.4"
          strokeDasharray="14 200"
          initial={{ strokeDashoffset: 0 }}
          animate={run ? { strokeDashoffset: -214 } : { strokeDashoffset: 0 }}
          transition={run ? { duration: 11, repeat: Infinity, ease: "linear" } : { duration: 0 }}
        />
      </svg>
    </div>
  );
}
