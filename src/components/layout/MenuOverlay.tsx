"use client";

import { useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { LEGAL_NAV, NAV, PHOTOS, SITE } from "@/content/site";
import { EASE } from "@/components/ui/Reveal";
import { useMenu } from "@/components/layout/menu-context";
import { OpenStatus } from "@/components/ui/OpenStatus";

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function MenuOverlay() {
  const { open, closeMenu } = useMenu();
  const pathname = usePathname();
  const reduced = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  const lastPath = useRef(pathname);
  /** Elemento que abrió el menú; al cerrar se le devuelve el foco (APG Modal Dialog). */
  const trigger = useRef<HTMLElement | null>(null);

  /**
   * Cierre por navegación: no se devuelve el foco al botón, sería robárselo a la
   * página nueva. Si el enlace apunta a la ruta actual no hay navegación, así
   * que ahí sí se conserva el disparador.
   */
  const closeForNav = useCallback(
    (href: string) => () => {
      if (href !== pathname) trigger.current = null;
      closeMenu();
    },
    [closeMenu, pathname],
  );

  // Cierra al navegar.
  useEffect(() => {
    if (lastPath.current !== pathname) {
      lastPath.current = pathname;
      trigger.current = null;
      closeMenu();
    }
  }, [pathname, closeMenu]);

  // Bloquea el scroll del documento mientras está abierto.
  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    root.classList.add("no-scroll");
    return () => root.classList.remove("no-scroll");
  }, [open]);

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        closeMenu();
        return;
      }
      if (event.key !== "Tab") return;
      const panel = panelRef.current;
      if (!panel) return;
      const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.offsetParent !== null);
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      }
    },
    [closeMenu],
  );

  // Escape también cuando el foco está en el botón del header.
  useEffect(() => {
    if (!open) return;
    const onEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMenu();
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [open, closeMenu]);

  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    const timer = window.setTimeout(() => {
      panel?.querySelector<HTMLElement>(FOCUSABLE)?.focus();
    }, 80);
    return () => window.clearTimeout(timer);
  }, [open]);

  // Guarda el disparador al abrir y le devuelve el foco al cerrar (X, Escape o
  // clic fuera). Sin esto el foco cae a <body> al desmontar el panel.
  useEffect(() => {
    if (open) {
      const active = document.activeElement;
      trigger.current =
        active instanceof HTMLElement && active !== document.body
          ? active
          : document.querySelector<HTMLElement>('[aria-controls="menu-principal"]');
      return;
    }
    const el = trigger.current;
    trigger.current = null;
    if (!el) return; // montaje inicial (open === false): no roba el foco
    // rAF: evita la carrera con el desmontaje de AnimatePresence.
    const id = window.requestAnimationFrame(() => {
      if (document.body.contains(el)) el.focus();
    });
    return () => window.cancelAnimationFrame(id);
  }, [open]);

  const photo = PHOTOS.camino;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="menu"
          id="menu-principal"
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label="Menú principal"
          data-lenis-prevent
          onKeyDown={onKeyDown}
          className="fixed inset-0 z-80 overflow-y-auto overscroll-contain bg-volcan-950 text-sillar-50"
          initial={reduced ? { opacity: 0 } : { opacity: 0, clipPath: "inset(0 0 100% 0)" }}
          animate={reduced ? { opacity: 1 } : { opacity: 1, clipPath: "inset(0 0 0% 0)" }}
          exit={reduced ? { opacity: 0 } : { opacity: 0, clipPath: "inset(0 0 100% 0)" }}
          transition={{ duration: reduced ? 0.2 : 0.6, ease: EASE }}
        >
          <div className="min-h-full">
            <div className="container-site grid gap-[clamp(40px,6vw,88px)] pt-[calc(var(--header-h)+clamp(28px,7vh,72px))] pb-[clamp(48px,9vh,96px)] lg:grid-cols-[1.05fr_0.95fr]">
              <motion.nav
                aria-label="Secciones"
                initial="hidden"
                animate="show"
                variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06, delayChildren: 0.12 } } }}
              >
                <ul className="flex flex-col">
                  {NAV.map((item, index) => (
                    <motion.li
                      key={item.href}
                      variants={
                        reduced
                          ? { hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.3 } } }
                          : { hidden: { opacity: 0, y: 26 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } } }
                      }
                      className="border-b border-sillar-50/12"
                    >
                      <Link
                        href={item.href}
                        onClick={closeForNav(item.href)}
                        aria-current={pathname === item.href ? "page" : undefined}
                        className="group flex items-baseline gap-5 py-[clamp(10px,1.6vh,20px)] transition-colors duration-300 hover:text-ocre-300"
                      >
                        <span className="t-mono-num w-7 shrink-0 text-sillar-50/35">{String(index + 1).padStart(2, "0")}</span>
                        <span className="t-display link-line">{item.label}</span>
                      </Link>
                    </motion.li>
                  ))}
                </ul>

                <motion.div
                  variants={
                    reduced
                      ? { hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.3 } } }
                      : { hidden: { opacity: 0, y: 26 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } } }
                  }
                  className="mt-[clamp(28px,4vh,48px)] flex flex-wrap items-center gap-4"
                >
                  <Link href="/reservas" onClick={closeForNav("/reservas")} className="btn btn-light">
                    Reservar un evento
                  </Link>
                  <OpenStatus tone="dark" />
                </motion.div>
              </motion.nav>

              <aside className="hidden flex-col gap-8 lg:flex">
                <motion.figure
                  initial={reduced ? { opacity: 0 } : { opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2, ease: EASE }}
                >
                  <div className="relative aspect-4/3 overflow-hidden bg-volcan-800">
                    <Image
                      src={photo.src}
                      alt={photo.alt}
                      fill
                      sizes="(min-width: 1024px) 40vw, 100vw"
                      className="object-cover"
                    />
                  </div>
                  <figcaption className="t-caption mt-4 text-sillar-50/80">{photo.caption}</figcaption>
                </motion.figure>

                <div className="grid gap-7 sm:grid-cols-2">
                  <div>
                    <p className="t-label t-label-light">Dónde</p>
                    <p className="mt-2 text-sm leading-relaxed text-sillar-50/85">
                      {SITE.address.street}
                      <br />
                      {SITE.address.district}, {SITE.address.city}
                      <br />
                      {SITE.address.country}
                    </p>
                  </div>
                  <div>
                    <p className="t-label t-label-light">Horario</p>
                    <p className="mt-2 text-sm leading-relaxed text-sillar-50/85">
                      Todos los días
                      <br />
                      {SITE.hours.open} – {SITE.hours.close} h
                    </p>
                  </div>
                </div>

                <ul className="flex flex-col gap-2">
                  {LEGAL_NAV.map((item) => (
                    <li key={item.href}>
                      <Link href={item.href} onClick={closeForNav(item.href)} className="link-line text-sm text-sillar-50/60 transition-colors hover:text-sillar-50">
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </aside>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
