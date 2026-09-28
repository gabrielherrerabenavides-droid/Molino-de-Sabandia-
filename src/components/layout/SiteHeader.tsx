"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { CalendarDays, Ticket } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { SITE } from "@/content/site";
import { useMenu } from "@/components/layout/menu-context";
import { EASE } from "@/components/ui/Reveal";

/** Rutas que abren con hero oscuro a sangre. Por ahora solo la portada. */
const DARK_HERO_ROUTES = new Set(["/"]);

/**
 * Header de museo (referencia: Guggenheim Bilbao): hamburguesa a la izquierda,
 * logo centrado y "Reservar" a la derecha. En la portada el logo permanece
 * oculto hasta que aparece la cabecera sólida; entonces entra en negro.
 * `data-intro="ui"` lo hace aparecer al final del splash de la portada.
 */
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
  const showLogo = !overDarkHero || scrolled;
  const lineTransition = { duration: reduced ? 0.001 : 0.32, ease: EASE };

  return (
    <header
      data-intro="ui"
      data-solid={solid ? "true" : "false"}
      className={clsx(
        "fixed inset-x-0 top-0 z-90 transition-[background-color,border-color,color] duration-500",
        "border-b",
        solid ? "border-sillar-300 bg-sillar-50/95 text-volcan-900 backdrop-blur-md" : "border-transparent text-sillar-50",
      )}
      style={{ height: "var(--header-h)" }}
    >
      {/* En la portada, sin máximo de 1440 px para alinearse con el nombre a sangre. */}
      <div
        className={clsx(
          overDarkHero ? "container-hero" : "container-site",
          "grid h-full grid-cols-[1fr_auto_1fr] items-center gap-[8px] sm:gap-[12px]",
        )}
      >
        <button
          type="button"
          onClick={toggleMenu}
          aria-expanded={open}
          aria-controls="menu-principal"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          className="-ml-[8px] inline-flex size-[44px] items-center justify-center justify-self-start transition-colors duration-300 hover:text-ocre-500"
        >
          <span className="relative block h-[13px] w-[32px]" aria-hidden="true">
            <motion.span
              className="absolute left-0 block h-[1.5px] w-full bg-current"
              animate={open ? { top: 6, rotate: 45 } : { top: 0, rotate: 0 }}
              transition={lineTransition}
              style={{ top: 0 }}
            />
            <motion.span
              className="absolute top-[6px] left-0 block h-[1.5px] w-full bg-current"
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

        <Link
          href="/"
          aria-label={`${SITE.name} — inicio`}
          className={clsx(
            "inline-flex min-h-[44px] items-center justify-center py-1 transition-[opacity,visibility] duration-500 hover:opacity-75",
            showLogo ? "visible opacity-100" : "invisible opacity-0",
          )}
        >
          <Image
            src="/logo-molino-blanco.png"
            alt=""
            width={984}
            height={305}
            priority
            sizes="(max-width: 399px) 100px, (max-width: 767px) 118px, (max-width: 1023px) 180px, 220px"
            className={clsx(
              "h-auto w-[100px] transition-[filter] duration-500 min-[400px]:w-[118px] sm:w-[180px] lg:w-[220px]",
              solid && "invert",
            )}
          />
        </Link>

        <div className="flex items-center gap-[4px] justify-self-end sm:gap-[8px]">
          <Link
            href="/visita"
            aria-label="Ver horarios y tarifas"
            title="Horarios y tarifas"
            className={clsx(
              "inline-flex size-[44px] shrink-0 items-center justify-center transition-[background-color,border-color,color] duration-300",
              light
                ? "hover:text-ocre-300"
                : "border border-sillar-300 hover:border-ocre-500 hover:bg-sillar-100 hover:text-ocre-500",
            )}
          >
            <Ticket size={21} strokeWidth={1.5} aria-hidden="true" />
          </Link>

          {light ? (
            <Link
              href="/reservas"
              className="-mr-[4px] inline-flex min-h-[44px] items-center gap-[10px] px-[4px] text-[0.8rem] font-medium tracking-[0.08em] min-[400px]:tracking-[0.14em] uppercase transition-colors duration-300 hover:text-ocre-300 sm:text-[0.86rem]"
            >
              <CalendarDays size={19} strokeWidth={1.4} aria-hidden="true" className="hidden sm:block" />
              Reservar
            </Link>
          ) : (
            <>
              <Link href="/reservas" className="btn btn-sm btn-primary hidden sm:inline-flex">
                Reservar
              </Link>
              <Link
                href="/reservas"
                className="link-line -mr-[4px] inline-flex min-h-[44px] items-center px-[4px] text-[0.8rem] font-medium tracking-[0.08em] min-[400px]:tracking-[0.14em] uppercase sm:hidden"
              >
                Reservar
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
