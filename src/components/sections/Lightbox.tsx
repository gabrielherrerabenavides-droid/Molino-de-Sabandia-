"use client";
import { useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { Photo } from "@/content/site";
import { EASE } from "@/components/ui/Reveal";

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Visor a pantalla completa para GalleryGrid. Teclado ←/→/Esc, cierre al tocar
 * el fondo, contador 01/08 y crédito con enlace a la fuente (DESIGN.md §5–§7).
 *
 * Se renderiza en un portal a <body> y con z-100 para quedar por encima de la
 * escala de capas del sitio: 55 cookies · 60 grano · 80 menú · 90 cabecera.
 */
export function Lightbox({
  photos,
  index,
  onClose,
  onIndexChange,
}: {
  photos: Photo[];
  index: number | null;
  onClose: () => void;
  onIndexChange: (index: number) => void;
}) {
  const reduced = useReducedMotion();
  const isOpen = index !== null;
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const goTo = useCallback(
    (next: number) => {
      const total = photos.length;
      onIndexChange(((next % total) + total) % total);
    },
    [photos.length, onIndexChange]
  );

  // Apertura: bloquea el scroll, lleva el foco al botón de cerrar y lo devuelve al cerrar.
  useEffect(() => {
    if (!isOpen) return;
    const anterior = document.activeElement as HTMLElement | null;
    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const foco = window.setTimeout(() => closeRef.current?.focus(), 0);
    return () => {
      window.clearTimeout(foco);
      document.body.style.overflow = overflowPrevio;
      if (anterior && document.contains(anterior)) anterior.focus();
    };
  }, [isOpen]);

  // Teclado: Escape, flechas y trampa de foco dentro del diálogo.
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key === "ArrowRight" && index !== null) {
        goTo(index + 1);
        return;
      }
      if (event.key === "ArrowLeft" && index !== null) {
        goTo(index - 1);
        return;
      }
      if (event.key !== "Tab") return;
      const panel = panelRef.current;
      if (!panel) return;
      const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.offsetParent !== null);
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (!panel.contains(document.activeElement)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, index, goTo, onClose]);

  const photo = index !== null ? photos[index] : null;
  // El portal necesita `document`: en el servidor no se renderiza nada (el visor
  // solo existe tras una interacción del visitante, siempre en el cliente).
  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {index !== null && photo && (
        <motion.div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label={`Imagen ${index + 1} de ${photos.length}: ${photo.alt}`}
          tabIndex={-1}
          className="fixed inset-0 z-100 flex flex-col bg-volcan-950/95"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0.15 : 0.35, ease: EASE }}
          onClick={onClose}
        >
          <div className="flex items-center justify-between px-5 py-4 text-sillar-50 md:px-8 md:py-6">
            <p className="t-label !text-sillar-300">
              {String(index + 1).padStart(2, "0")} / {String(photos.length).padStart(2, "0")}
            </p>
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label="Cerrar galería"
              className="grid size-[44px] shrink-0 place-items-center text-sillar-50 transition-colors hover:text-ocre-300"
            >
              <X size={26} aria-hidden />
            </button>
          </div>

          <div className="relative flex-1 px-2 md:px-4" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => goTo(index - 1)}
              aria-label="Foto anterior"
              className="absolute left-1 top-1/2 z-10 grid size-[44px] -translate-y-1/2 place-items-center text-sillar-50 transition-colors hover:text-ocre-300 md:left-4"
            >
              <ChevronLeft size={32} aria-hidden />
            </button>
            <div className="relative h-full w-full">
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="100vw"
                className="photo-grade object-contain"
                priority
              />
            </div>
            <button
              type="button"
              onClick={() => goTo(index + 1)}
              aria-label="Foto siguiente"
              className="absolute right-1 top-1/2 z-10 grid size-[44px] -translate-y-1/2 place-items-center text-sillar-50 transition-colors hover:text-ocre-300 md:right-4"
            >
              <ChevronRight size={32} aria-hidden />
            </button>
          </div>

          <div
            className="flex flex-col gap-1 px-5 py-4 text-sillar-50 md:px-8 md:py-6"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="t-caption max-w-prose-narrow">{photo.caption}</p>
            <p className="t-label !text-sillar-300">
              {photo.author} · {photo.year} · {photo.license} ·{" "}
              <a href={photo.source} target="_blank" rel="noopener noreferrer" className="link-line">
                Ver fuente
              </a>
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
