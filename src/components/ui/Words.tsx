"use client";

import { clsx } from "clsx";
import { motion } from "motion/react";
import { EASE } from "@/components/ui/Reveal";

/**
 * Entrada palabra por palabra (DESIGN.md §5). `lines` permite forzar los
 * saltos de línea del titular; cada palabra entra con `stagger` de retraso.
 *
 * Con `onMount` (titulares sobre el pliegue, como el `<h1>` del hero, que es el
 * elemento LCP de la portada) la animación es CSS pura: Motion serializaría
 * `opacity:0` en línea en el HTML prerenderizado y el titular no se vería hasta
 * terminar la hidratación. Con `@keyframes` + `animation-fill-mode: both` el
 * efecto es el mismo (stagger de 50 ms, y 40→0) pero lo ejecuta el compositor
 * desde el primer fotograma, sin depender del JS. Bajo el pliegue se sigue
 * usando Motion, que necesita `whileInView`.
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
  if (onMount) {
    return (
      <span className={clsx("block", className)}>
        {lines.map((line, lineIndex) => {
          // Índice global de la palabra: alimenta el retardo escalonado en CSS.
          const offset = lines.slice(0, lineIndex).reduce((total, previous) => total + previous.split(" ").length, 0);
          const words = line.split(" ");
          return (
            <span key={lineIndex} className={clsx("block", clip && "overflow-hidden pb-[0.04em]", lineClassName)}>
              {words.map((word, index) => (
                <span
                  key={`${lineIndex}-${index}`}
                  className="word-in inline-block whitespace-pre"
                  style={
                    {
                      "--i": String(offset + index),
                      "--rise-y": `${y}px`,
                      "--rise-delay": `${delay}s`,
                      "--word-stagger": `${stagger}s`,
                    } as React.CSSProperties
                  }
                >
                  {word}
                  {index < words.length - 1 ? " " : ""}
                </span>
              ))}
            </span>
          );
        })}
      </span>
    );
  }

  const wordVariants = {
    hidden: { opacity: 0, y },
    show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: EASE } },
  };

  return (
    <motion.span
      className={clsx("block", className)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-10% 0px" }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: stagger, delayChildren: delay } } }}
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
