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

  // Navegación interna:
  //  - cancela la introducción de la portada (la ruta nueva no hereda el bloqueo);
  //  - en una navegación NUEVA deja la página arriba del todo antes del pintado.
  //    Sin esto, si la inercia de Lenis seguía activa, deshacía el scroll a 0 de
  //    Next y la página nueva aparecía a media altura (p. ej. al pulsar "Reservar");
  //  - en atrás/adelante no fuerza nada: solo corta la inercia para no pelear con
  //    la restauración de la posición.
  const pathname = usePathname();
  const lastPath = useRef(pathname);
  const lastPop = useRef(-Infinity);

  useEffect(() => {
    const onPop = () => {
      lastPop.current = performance.now();
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useLayoutEffect(() => {
    if (pathname === lastPath.current) return;
    lastPath.current = pathname;
    document.documentElement.classList.remove(...SPLASH_CLASSES);

    const lenis = getLenis();
    const isHistoryNav = performance.now() - lastPop.current < 1500;
    if (isHistoryNav || window.location.hash) {
      if (lenis && !lenis.isStopped) {
        lenis.stop();
        lenis.start();
      }
      return;
    }
    window.scrollTo(0, 0);
    lenis?.scrollTo(0, { immediate: true, force: true });
  }, [pathname]);

  // Enlace a la página en la que ya estás (p. ej. "Reservar" dentro de /reservas):
  // Next no desplaza, así que subimos nosotros. No se usa `defaultPrevented`
  // porque <Link> siempre lo marca.
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = (event.target as Element | null)?.closest?.("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if ((anchor.target && anchor.target !== "_self") || anchor.hasAttribute("download")) return;
      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname !== window.location.pathname || url.hash) return;
      const lenis = getLenis();
      const menuOpen = document.documentElement.classList.contains("no-scroll");
      if (lenis && !lenis.isStopped) lenis.scrollTo(0, { duration: 1.1 });
      else window.scrollTo({ top: 0, behavior: menuOpen ? "auto" : "smooth" });
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}
