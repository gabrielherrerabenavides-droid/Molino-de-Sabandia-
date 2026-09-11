"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown, Pause, Play } from "lucide-react";
import { motion, useAnimationControls, useReducedMotion } from "motion/react";
import { PHOTOS, SITE } from "@/content/site";
import { EASE } from "@/components/ui/Reveal";
import { Words } from "@/components/ui/Words";
import { OpenStatus } from "@/components/ui/OpenStatus";

const photo = PHOTOS.fachada;

export function Hero() {
  const reduced = useReducedMotion();
  const [paused, setPaused] = useState(false);
  const controls = useAnimationControls();

  useEffect(() => {
    if (reduced) {
      controls.set({ scale: 1.02 });
      return;
    }
    if (paused) {
      controls.stop();
      return;
    }
    void controls.start(
      { scale: 1.08 },
      { duration: 22, ease: "linear", repeat: Infinity, repeatType: "reverse" },
    );
  }, [paused, reduced, controls]);

  return (
    <section
      aria-label="Molino de Sabandía"
      className="relative isolate flex h-[100svh] min-h-[640px] flex-col overflow-hidden bg-volcan-950 text-sillar-50"
    >
      <div aria-hidden="true" className="absolute inset-0 -z-10 overflow-hidden">
        <motion.div className="absolute inset-0" initial={{ scale: 1 }} animate={controls} style={{ willChange: "transform" }}>
          <Image
            src={photo.src}
            alt={photo.alt}
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
        </motion.div>
        <div className="absolute inset-0 hero-overlay" />
        <div className="absolute inset-0 hero-overlay-side" />
      </div>

      <div className="container-site relative flex flex-1 flex-col pt-[calc(var(--header-h)+clamp(20px,5vh,56px))] pb-[clamp(20px,4vh,44px)]">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.1, ease: EASE }}
          className="t-label t-label-light max-w-[34ch] text-shade"
        >
          Arequipa, Perú · 1621 — Arquitectura. Agua. Memoria.
        </motion.p>

        <div className="mt-auto">
          <h1 className="t-hero text-shade">
            <Words lines={["Molino de", "Sabandía"]} onMount delay={0.2} stagger={0.05} y={40} />
          </h1>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.55, ease: EASE }}
            className="mt-[clamp(16px,2.4vh,28px)] max-w-[54ch]"
          >
            <p className="t-caption text-sillar-50/85 text-shade">{SITE.tagline}.</p>
            <p className="mt-3 text-[0.98rem] leading-relaxed text-sillar-50/75 text-shade">
              Cuatro siglos después, el agua del manantial sigue girando la rueda y las piedras siguen moliendo.
              Ven a verlo entre sillar, jardines y campiña.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.7, ease: EASE }}
            className="mt-[clamp(20px,3vh,36px)] flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <a href="#destacados" className="btn btn-light">
              Entra al molino
            </a>
            <Link href="/reservas" className="btn btn-ghost-light">
              Reservar un evento
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9, delay: 0.9, ease: EASE }}
          className="mt-[clamp(24px,4vh,52px)] flex items-end justify-between gap-4"
        >
          <div className="flex flex-col gap-3">
            <OpenStatus tone="light" />
            <a
              href="#destacados"
              aria-label="Bajar al contenido"
              className="hidden items-center gap-2 text-sillar-50/70 transition-colors hover:text-sillar-50 sm:inline-flex"
            >
              <motion.span
                aria-hidden="true"
                animate={{ y: [0, 7, 0] }}
                transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
                className="inline-flex"
              >
                <ArrowDown size={16} strokeWidth={1.5} />
              </motion.span>
              <span className="t-label t-label-inherit">Desliza</span>
            </a>
          </div>

          <div className="flex shrink-0 flex-col items-end gap-2">
            <button
              type="button"
              onClick={() => setPaused((v) => !v)}
              aria-pressed={paused}
              className="inline-flex size-11 items-center justify-center rounded-full border border-sillar-50/40 text-sillar-50 transition-colors duration-300 hover:border-sillar-50 hover:bg-sillar-50 hover:text-volcan-950"
            >
              <span className="sr-only">{paused ? "Reanudar movimiento" : "Pausar movimiento"}</span>
              {paused ? <Play size={15} strokeWidth={1.6} aria-hidden="true" /> : <Pause size={15} strokeWidth={1.6} aria-hidden="true" />}
            </button>
            <p className="max-w-[24ch] text-right text-[0.64rem] leading-tight tracking-[0.08em] text-sillar-50/55 uppercase">
              {photo.author} · {photo.year}
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
