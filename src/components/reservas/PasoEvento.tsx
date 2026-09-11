"use client";

import { clsx } from "clsx";
import { motion, useReducedMotion } from "motion/react";
import { EVENT_TYPES } from "@/content/site";
import { EASE } from "@/components/ui/Reveal";

/** Paso 1: elección del tipo de evento. */
export function PasoEvento({ valor, onElegir }: { valor: string | null; onElegir: (slug: string) => void }) {
  const reducido = useReducedMotion();

  return (
    <fieldset>
      <legend className="t-h2 mb-2">¿Qué quieres celebrar?</legend>
      <p className="t-body max-w-prose-narrow mb-8 text-muted">
        Elige el tipo de evento. Cada uno tiene sus franjas horarias y su aforo.
      </p>

      <div className="grid gap-px sm:grid-cols-2">
        {EVENT_TYPES.map((tipo) => {
          const elegido = valor === tipo.slug;
          return (
            <button
              key={tipo.slug}
              type="button"
              onClick={() => onElegir(tipo.slug)}
              aria-pressed={elegido}
              className={clsx(
                "relative flex min-h-[132px] flex-col items-start gap-2 border p-5 text-left transition-colors duration-300 sm:p-6",
                elegido ? "border-volcan-950 bg-white" : "border-sillar-300 bg-white/60 hover:border-volcan-700",
              )}
            >
              {elegido && (
                <motion.span
                  layoutId="evento-activo"
                  aria-hidden
                  className="pointer-events-none absolute inset-0 border border-volcan-950"
                  transition={reducido ? { duration: 0 } : { duration: 0.45, ease: EASE }}
                />
              )}
              <span className="t-h3">{tipo.title}</span>
              <span className="t-body text-muted">{tipo.short}</span>
              <span className="t-label mt-auto pt-2">
                {tipo.minGuests === tipo.maxGuests
                  ? `${tipo.maxGuests} personas`
                  : `De ${tipo.minGuests} a ${tipo.maxGuests} personas`}
              </span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
