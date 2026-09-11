"use client";
import { useId, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { Plus } from "lucide-react";
import { clsx } from "clsx";
import { FAQ } from "@/content/site";
import { EASE } from "@/components/ui/Reveal";

/** Acordeón de preguntas frecuentes con animación de altura y aria-expanded. */
export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const reduced = useReducedMotion();
  const baseId = useId();

  return (
    <div className="divide-y divide-sillar-300 border-t border-sillar-300">
      {FAQ.map((item, i) => {
        const isOpen = openIndex === i;
        const panelId = `${baseId}-panel-${i}`;
        const buttonId = `${baseId}-button-${i}`;
        return (
          <div key={item.q}>
            <h3>
              <button
                id={buttonId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpenIndex(isOpen ? null : i)}
                className="flex w-full min-h-[44px] items-center justify-between gap-4 py-5 text-left"
              >
                <span className="t-h3">{item.q}</span>
                <Plus
                  size={22}
                  aria-hidden
                  className={clsx("shrink-0 text-ocre-500 transition-transform duration-300", isOpen && "rotate-45")}
                />
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: reduced ? 0.15 : 0.4, ease: EASE }}
                  className="overflow-hidden"
                >
                  <p className="t-body max-w-prose-narrow pb-5 text-volcan-700">{item.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
