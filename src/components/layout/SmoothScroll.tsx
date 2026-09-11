"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { useMenu } from "@/components/layout/menu-context";
import { SPLASH_CLASSES } from "@/lib/splash";

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
    if (open) {
      lenis.stop();
      return;
    }
    // Durante el splash de la portada el scroll está bloqueado (src/lib/splash.ts):
    // Lenis se reanuda exactamente cuando el script retira `splash-lock`.
    const html = document.documentElement;
    if (html.classList.contains("splash-lock")) {
      lenis.stop();
      const observer = new MutationObserver(() => {
        if (!html.classList.contains("splash-lock")) {
          observer.disconnect();
          lenis.start();
        }
      });
      observer.observe(html, { attributes: true, attributeFilter: ["class"] });
      return () => observer.disconnect();
    }
    lenis.start();
  }, [open]);

  // Una navegación interna cancela la introducción antes del pintado: la ruta
  // nueva no hereda el bloqueo y volver a "/" no repite el splash.
  const pathname = usePathname();
  const initialPath = useRef(pathname);
  useLayoutEffect(() => {
    if (pathname === initialPath.current) return;
    document.documentElement.classList.remove(...SPLASH_CLASSES);
  }, [pathname]);

  return null;
}
