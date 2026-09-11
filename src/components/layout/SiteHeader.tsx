"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { motion, useReducedMotion } from "motion/react";
import { SITE } from "@/content/site";
import { useMenu } from "@/components/layout/menu-context";
import { EASE } from "@/components/ui/Reveal";

/** Rutas que abren con hero oscuro a sangre. Por ahora solo la portada. */
const DARK_HERO_ROUTES = new Set(["/"]);

export function SiteHeader() {
  const pathname = usePathname();
  const { open, toggleMenu } = useMenu();
  const [scrolled, setScrolled] = useState(false);
  const reduced = useReducedMotion();

  const overDarkHero = DARK_HERO_ROUTES.has(pathname);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Sólida cuando: no hay hero oscuro, o ya se hizo scroll. Nunca con el menú abierto.
  const solid = !open && (!overDarkHero || scrolled);
  const light = !solid;

  const lineTransition = { duration: reduced ? 0.001 : 0.32, ease: EASE };

  return (
    <header
      data-solid={solid ? "true" : "false"}
      className={clsx(
        "fixed inset-x-0 top-0 z-90 transition-[background-color,border-color,color] duration-500",
        "border-b",
        solid ? "border-sillar-300 bg-sillar-50/95 text-volcan-900 backdrop-blur-md" : "border-transparent text-sillar-50",
      )}
      style={{ height: "var(--header-h)" }}
    >
      <div className="container-site flex h-full items-center justify-between gap-4">
        <Link
          href="/"
          aria-label={`${SITE.name} — inicio`}
          className="group -ml-0.5 inline-flex min-h-11 shrink-0 items-center py-2 pr-2 transition-colors duration-300 hover:text-ocre-500"
        >
          <span className="t-wordmark hidden sm:block">Molino de Sabandía</span>
          <span className="t-wordmark t-wordmark-sm block sm:hidden">
            Molino
            <br />
            de Sabandía
          </span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/reservas"
            className={clsx(
              "hidden sm:inline-flex",
              "btn btn-sm",
              light ? "btn-ghost-light" : "btn-primary",
            )}
          >
            Reservar
          </Link>
          <Link
            href="/reservas"
            className="link-line inline-flex min-h-11 items-center px-1 text-[0.82rem] font-medium tracking-[0.12em] uppercase sm:hidden"
          >
            Reservar
          </Link>

          <button
            type="button"
            onClick={toggleMenu}
            aria-expanded={open}
            aria-controls="menu-principal"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            className="-mr-2 inline-flex size-11 items-center justify-center transition-colors duration-300 hover:text-ocre-500"
          >
            <span className="relative block h-[13px] w-7" aria-hidden="true">
              <motion.span
                className="absolute left-0 block h-[1.5px] w-full bg-current"
                animate={open ? { top: 6, rotate: 45 } : { top: 0, rotate: 0 }}
                transition={lineTransition}
                style={{ top: 0 }}
              />
              <motion.span
                className="absolute top-1.5 left-0 block h-[1.5px] w-full bg-current"
                animate={open ? { opacity: 0, scaleX: 0.4 } : { opacity: 1, scaleX: 1 }}
                transition={lineTransition}
              />
              <motion.span
                className="absolute left-0 block h-[1.5px] w-full bg-current"
                animate={open ? { top: 6, rotate: -45 } : { top: 12, rotate: 0 }}
                transition={lineTransition}
                style={{ top: 12 }}
              />
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
