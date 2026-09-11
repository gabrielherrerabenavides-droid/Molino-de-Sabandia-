"use client";
import { motion, type Variants } from "motion/react";
import { clsx } from "clsx";

export const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Nota: `prefers-reduced-motion` se respeta globalmente con
 * `<MotionConfig reducedMotion="user">` en `Providers`, que desactiva las
 * animaciones de transformación y deja solo la opacidad. Por eso aquí no se
 * ramifica el estado inicial (evita desajustes de hidratación).
 */
const variants: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } },
};

/** Reveal al entrar en viewport (DESIGN.md §5). Usa `stagger` para animar hijos `RevealItem`. */
export function Reveal({ children, className, delay = 0, stagger, as = "div" }: {
  children: React.ReactNode; className?: string; delay?: number; stagger?: number; as?: "div" | "section" | "ul" | "li" | "header" | "figure";
}) {
  const Tag = motion[as];
  return (
    <Tag
      className={clsx(className)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-10% 0px" }}
      variants={stagger ? { hidden: {}, show: { transition: { staggerChildren: stagger, delayChildren: delay } } } : variants}
      transition={{ delay }}
    >
      {children}
    </Tag>
  );
}

export function RevealItem({ children, className, as = "div" }: { children: React.ReactNode; className?: string; as?: "div" | "li" | "figure" | "article" }) {
  const Tag = motion[as];
  return <Tag className={className} variants={variants}>{children}</Tag>;
}
