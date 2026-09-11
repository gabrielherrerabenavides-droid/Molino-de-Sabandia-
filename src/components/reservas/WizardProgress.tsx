"use client";

import { clsx } from "clsx";
import { motion, useReducedMotion } from "motion/react";
import { EASE } from "@/components/ui/Reveal";

export const PASOS = ["Evento", "Fecha", "Datos", "Confirmar"] as const;

/** Barra "01 Evento — 02 Fecha — 03 Datos — 04 Confirmar" (DESIGN.md §6, junta de sillar). */
export function WizardProgress({ paso, onIr }: { paso: number; onIr: (indice: number) => void }) {
  const reducido = useReducedMotion();

  return (
    <ol className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
      {PASOS.map((nombre, i) => {
        const activo = i === paso;
        const visitado = i < paso;
        const accesible = i <= paso;
        return (
          <li key={nombre}>
            <button
              type="button"
              onClick={() => accesible && onIr(i)}
              disabled={!accesible}
              aria-current={activo ? "step" : undefined}
              className={clsx(
                "group flex min-h-11 w-full flex-col items-start justify-center gap-2 text-left",
                accesible ? "cursor-pointer" : "cursor-default",
              )}
            >
              <span className="relative block h-0.5 w-full">
                <span aria-hidden className="stone-rule absolute inset-0 block" />
                {activo && (
                  <motion.span
                    layoutId="paso-activo"
                    aria-hidden
                    className="absolute inset-x-0 top-0 block h-px bg-ocre-500"
                    transition={reducido ? { duration: 0 } : { duration: 0.45, ease: EASE }}
                  />
                )}
                {visitado && <span aria-hidden className="absolute inset-x-0 top-0 block h-px bg-volcan-900" />}
              </span>
              <span
                className={clsx(
                  "t-label transition-colors duration-300",
                  activo ? "text-ocre-500" : visitado ? "text-volcan-900" : "text-muted",
                )}
              >
                <span className="t-mono-num mr-2">{String(i + 1).padStart(2, "0")}</span>
                {nombre}
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
