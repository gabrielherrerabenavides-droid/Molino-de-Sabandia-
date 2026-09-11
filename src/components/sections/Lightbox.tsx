"use client";
import { useEffect, useCallback } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { Photo } from "@/content/site";
import { EASE } from "@/components/ui/Reveal";

/**
 * Visor a pantalla completa para GalleryGrid. Teclado ←/→/Esc, cierre al tocar
 * el fondo, contador 01/08 y crédito con enlace a la fuente (DESIGN.md §5–§7).
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

  const goTo = useCallback(
    (next: number) => {
      const total = photos.length;
      onIndexChange(((next % total) + total) % total);
    },
    [photos.length, onIndexChange]
  );

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight" && index !== null) goTo(index + 1);
      if (event.key === "ArrowLeft" && index !== null) goTo(index - 1);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, index, goTo, onClose]);

  const photo = index !== null ? photos[index] : null;

  return (
    <AnimatePresence>
      {isOpen && photo && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={`Imagen ${index! + 1} de ${photos.length}: ${photo.alt}`}
          className="fixed inset-0 z-[70] flex flex-col bg-volcan-950/95"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0.15 : 0.35, ease: EASE }}
          onClick={onClose}
        >
          <div className="flex items-center justify-between px-5 py-4 text-sillar-50 md:px-8 md:py-6">
            <p className="t-label !text-sillar-300">
              {String(index! + 1).padStart(2, "0")} / {String(photos.length).padStart(2, "0")}
            </p>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar galería"
              className="grid h-11 w-11 place-items-center text-sillar-50 transition-colors hover:text-ocre-300"
            >
              <X size={26} aria-hidden />
            </button>
          </div>

          <div className="relative flex-1 px-2 md:px-4" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => goTo(index! - 1)}
              aria-label="Foto anterior"
              className="absolute left-1 top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center text-sillar-50 transition-colors hover:text-ocre-300 md:left-4"
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
              onClick={() => goTo(index! + 1)}
              aria-label="Foto siguiente"
              className="absolute right-1 top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center text-sillar-50 transition-colors hover:text-ocre-300 md:right-4"
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
    </AnimatePresence>
  );
}
