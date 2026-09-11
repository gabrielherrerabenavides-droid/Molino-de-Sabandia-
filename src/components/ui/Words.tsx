"use client";

import { clsx } from "clsx";
import { motion } from "motion/react";
import { EASE } from "@/components/ui/Reveal";

/**
 * Entrada palabra por palabra (DESIGN.md §5). `lines` permite forzar los
 * saltos de línea del titular; cada palabra entra con `stagger` de retraso.
 */
export function Words({
  lines,
  className,
  lineClassName,
  delay = 0,
  stagger = 0.05,
  y = 40,
  clip = false,
  onMount = false,
}: {
  lines: readonly string[];
  className?: string;
  lineClassName?: string;
  delay?: number;
  stagger?: number;
  y?: number;
  clip?: boolean;
  onMount?: boolean;
}) {
  const wordVariants = {
    hidden: { opacity: 0, y },
    show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: EASE } },
  };

  const trigger = onMount
    ? ({ animate: "show" } as const)
    : ({ whileInView: "show", viewport: { once: true, margin: "-10% 0px" } } as const);

  return (
    <motion.span
      className={clsx("block", className)}
      initial="hidden"
      variants={{ hidden: {}, show: { transition: { staggerChildren: stagger, delayChildren: delay } } }}
      {...trigger}
    >
      {lines.map((line, lineIndex) => {
        const words = line.split(" ");
        return (
          <span key={lineIndex} className={clsx("block", clip && "overflow-hidden pb-[0.04em]", lineClassName)}>
            {words.map((word, wordIndex) => (
              <motion.span key={`${lineIndex}-${wordIndex}`} variants={wordVariants} className="inline-block whitespace-pre">
                {word}
                {wordIndex < words.length - 1 ? " " : ""}
              </motion.span>
            ))}
          </span>
        );
      })}
    </motion.span>
  );
}
