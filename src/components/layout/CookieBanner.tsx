"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { EASE } from "@/components/ui/Reveal";

const STORAGE_KEY = "msb-cookies";

/**
 * Aviso de cookies discreto. No carga scripts de terceros: solo guarda la
 * preferencia en localStorage para no volver a preguntar.
 */
export function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = window.localStorage.getItem(STORAGE_KEY);
    } catch {
      stored = "unavailable";
    }
    if (!stored) {
      const timer = window.setTimeout(() => setVisible(true), 900);
      return () => window.clearTimeout(timer);
    }
  }, []);

  const decide = (value: "todas" | "necesarias") => {
    try {
      window.localStorage.setItem(STORAGE_KEY, value);
    } catch {
      /* almacenamiento no disponible: se volverá a preguntar */
    }
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="region"
          aria-label="Aviso de cookies"
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduced ? { opacity: 0 } : { opacity: 0, y: 24 }}
          transition={{ duration: reduced ? 0.2 : 0.5, ease: EASE }}
          className="fixed inset-x-0 bottom-0 z-55 border-t border-sillar-300 bg-sillar-50/97 pb-[env(safe-area-inset-bottom)] backdrop-blur-md"
        >
          <div className="container-site flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-2 sm:min-h-14 sm:flex-nowrap sm:py-0">
            <p className="text-[13px] leading-tight text-volcan-700 sm:text-[0.88rem] sm:leading-relaxed">
              <span className="sm:hidden">Cookies propias, sin rastreo.</span>
              <span className="hidden sm:inline">
                Usamos cookies propias para que la web funcione. Sin rastreo publicitario.
              </span>{" "}
              <Link href="/legal/cookies" className="link-line text-ocre-500">
                Política de cookies
              </Link>
            </p>
            <div className="flex shrink-0 gap-2">
              <button type="button" onClick={() => decide("necesarias")} className="btn btn-sm btn-ghost">
                Solo necesarias
              </button>
              <button type="button" onClick={() => decide("todas")} className="btn btn-sm btn-primary">
                Aceptar
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
