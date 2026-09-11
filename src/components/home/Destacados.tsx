"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { PHOTOS } from "@/content/site";
import { EASE } from "@/components/ui/Reveal";
import { Eyebrow } from "@/components/ui/Eyebrow";

const SLIDES = [
  {
    photo: PHOTOS.fachada,
    eyebrow: "Arquitectura · 1621",
    title: "La piedra que aprendió a moler.",
    text: "Muros de sillar, contrafuertes y acequias trazadas a mano. Todo el conjunto está pensado para que el agua haga el trabajo y la piedra lo aguante cuatro siglos.",
    cta: { label: "Leer la historia", href: "/historia" },
  },
  {
    photo: PHOTOS.camino,
    eyebrow: "Paisaje · Sabandía",
    title: "Un camino fuera de la prisa.",
    text: "A ocho kilómetros del centro de Arequipa, el camino se llena de árboles, acequias y campiña. Llegar ya es parte de la visita.",
    cta: { label: "Prepara tu visita", href: "/visita" },
  },
  {
    photo: PHOTOS.historica,
    eyebrow: "Archivo · 1981",
    title: "El tiempo también deja luz.",
    text: "Tras la restauración de 1973, el molino volvió a girar. Estas imágenes de archivo cuentan cómo se rescató sin planos, con la memoria de los campesinos.",
    cta: { label: "Ver la galería", href: "/galeria" },
  },
] as const;

export function Destacados() {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  const go = useCallback((delta: number) => {
    setDirection(delta);
    setIndex((current) => (current + delta + SLIDES.length) % SLIDES.length);
  }, []);

  const slide = SLIDES[index];

  return (
    <section
      id="destacados"
      aria-labelledby="destacados-title"
      aria-roledescription="carrusel"
      className="container-site pt-[clamp(48px,7vw,110px)] pb-[clamp(56px,8vw,130px)]"
    >
      <div className="flex flex-wrap items-end justify-between gap-6 pb-[clamp(20px,3vw,40px)]">
        <div>
          <Eyebrow tone="ocre" className="mb-4">
            Destacados
          </Eyebrow>
          <h2 id="destacados-title" className="t-display t-display-sm max-w-[24ch]">
            Tres maneras de mirar el molino.
          </h2>
        </div>
        <div className="flex items-center gap-5">
          <p className="t-mono-num text-muted">
            <span className="text-volcan-900">{String(index + 1).padStart(2, "0")}</span>
            <span aria-hidden="true"> / </span>
            {String(SLIDES.length).padStart(2, "0")}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Destacado anterior"
              className="inline-flex size-11 items-center justify-center border border-sillar-300 transition-colors duration-300 hover:border-volcan-950 hover:bg-volcan-950 hover:text-sillar-50"
            >
              <ArrowLeft size={17} strokeWidth={1.4} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Destacado siguiente"
              className="inline-flex size-11 items-center justify-center border border-sillar-300 transition-colors duration-300 hover:border-volcan-950 hover:bg-volcan-950 hover:text-sillar-50"
            >
              <ArrowRight size={17} strokeWidth={1.4} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
      <hr className="stone-rule mb-[clamp(24px,4vw,56px)]" />

      <div className="grid items-stretch gap-[clamp(24px,4vw,64px)] lg:grid-cols-[1.2fr_0.8fr]">
        <motion.div
          className="relative aspect-16/9 w-full touch-pan-y overflow-hidden bg-sillar-200"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.12}
          onDragEnd={(_event, info) => {
            if (info.offset.x < -60) go(1);
            else if (info.offset.x > 60) go(-1);
          }}
        >
          <AnimatePresence initial={false} mode="sync">
            <motion.div
              key={slide.photo.src}
              className="absolute inset-0"
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.9, ease: EASE }}
            >
              <Image
                src={slide.photo.src}
                alt={slide.photo.alt}
                fill
                /* Mismo `sizes` que el hero y que PageHero: la primera diapositiva
                   reutiliza la variante de PHOTOS.fachada ya precargada en vez de
                   descargar un segundo candidato del srcset. */
                sizes="100vw"
                className="photo-grade object-cover"
                draggable={false}
              />
            </motion.div>
          </AnimatePresence>
          <p className="t-label t-label-light absolute right-3 bottom-3 z-10 bg-volcan-950/55 px-2.5 py-1.5 lg:hidden">Desliza</p>
        </motion.div>

        <div className="flex flex-col justify-center">
          {/* Región viva estable (no keyed): al montar el nuevo bloque, el lector
              de pantalla anuncia "Diapositiva 2 de 3: <título>" y el resto del texto. */}
          <div
            role="group"
            aria-roledescription="diapositiva"
            aria-label={`Diapositiva ${index + 1} de ${SLIDES.length}: ${slide.title}`}
            aria-live="polite"
            aria-atomic="true"
          >
            {/* `initial={false}`: la primera diapositiva se sirve visible (sin
                `opacity:0` en línea en el HTML); los cambios posteriores sí animan. */}
            <AnimatePresence initial={false} mode="wait">
              <motion.div
                key={slide.title}
                initial={{ opacity: 0, y: 14 * direction }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 * direction }}
                transition={{ duration: 0.5, ease: EASE }}
              >
                <Eyebrow tone="ocre">{slide.eyebrow}</Eyebrow>
                <h3 className="t-h2 mt-5 max-w-[22ch]">{slide.title}</h3>
                <p className="t-body max-w-prose-narrow mt-5 text-volcan-700">{slide.text}</p>
                <Link href={slide.cta.href} className="link-line t-label-ocre mt-7 inline-block">
                  {slide.cta.label}
                </Link>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
