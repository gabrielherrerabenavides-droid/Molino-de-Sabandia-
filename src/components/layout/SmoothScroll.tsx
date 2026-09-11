"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { useMenu } from "@/components/layout/menu-context";

let instance: Lenis | null = null;

/** Instancia activa de Lenis (null en táctil o con movimiento reducido). */
export function getLenis(): Lenis | null {
  return instance;
}

/** Desplazamiento suave hasta un objetivo, con o sin Lenis. */
export function smoothScrollTo(target: number | string | HTMLElement, offset = 0) {
  const lenis = getLenis();
  if (lenis) {
    lenis.scrollTo(target, { offset, duration: 1.1 });
    return;
  }
  if (typeof window === "undefined") return;
  const el =
    typeof target === "string" ? document.querySelector<HTMLElement>(target) : typeof target === "number" ? null : target;
  const top = typeof target === "number" ? target : el ? el.getBoundingClientRect().top + window.scrollY : 0;
  window.scrollTo({ top: top + offset, behavior: "smooth" });
}

/**
 * Scroll suave con Lenis (DESIGN.md §5): solo en puntero fino y sin
 * `prefers-reduced-motion`. Integra su propio bucle de requestAnimationFrame.
 */
export function SmoothScroll() {
  const { open } = useMenu();

  useEffect(() => {
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!finePointer || reduced) return;

    const lenis = new Lenis({
      lerp: 0.1,
      autoRaf: false,
      anchors: { duration: 1.1 },
      smoothWheel: true,
      syncTouch: false,
    });
    instance = lenis;

    let frame = requestAnimationFrame(function raf(time: number) {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    });

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
      instance = null;
    };
  }, []);

  useEffect(() => {
    const lenis = getLenis();
    if (!lenis) return;
    if (open) lenis.stop();
    else lenis.start();
  }, [open]);

  return null;
}
