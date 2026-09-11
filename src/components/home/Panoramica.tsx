"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, MoveHorizontal } from "lucide-react";
import { PHOTOS } from "@/content/site";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";

const photo = PHOTOS.panoramica;

export function Panoramica() {
  const trackRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; scroll: number } | null>(null);
  const [dragging, setDragging] = useState(false);

  const scrollByViewport = useCallback((direction: number) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.7, behavior: "smooth" });
  }, []);

  return (
    <section aria-labelledby="panoramica-title" className="bg-volcan-950 pt-[clamp(48px,7vw,104px)] pb-[clamp(24px,3vw,40px)] text-sillar-50">
      <div className="container-site flex flex-wrap items-end justify-between gap-6 pb-[clamp(20px,3vw,40px)]">
        <Reveal>
          <Eyebrow tone="light" className="mb-4">
            Panorámica
          </Eyebrow>
          <h2 id="panoramica-title" className="t-display t-display-sm max-w-[22ch] text-sillar-50">
            {photo.caption}
          </h2>
        </Reveal>
        <div className="flex items-center gap-4">
          <p className="t-label t-label-light flex items-center gap-2">
            <MoveHorizontal aria-hidden="true" size={16} strokeWidth={1.4} />
            Arrastra para explorar
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => scrollByViewport(-1)}
              aria-label="Desplazar la panorámica a la izquierda"
              className="inline-flex size-11 items-center justify-center border border-sillar-50/35 transition-colors duration-300 hover:bg-sillar-50 hover:text-volcan-950"
            >
              <ArrowLeft size={17} strokeWidth={1.4} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => scrollByViewport(1)}
              aria-label="Desplazar la panorámica a la derecha"
              className="inline-flex size-11 items-center justify-center border border-sillar-50/35 transition-colors duration-300 hover:bg-sillar-50 hover:text-volcan-950"
            >
              <ArrowRight size={17} strokeWidth={1.4} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      <div
        ref={trackRef}
        data-lenis-prevent
        tabIndex={0}
        role="group"
        aria-label="Panorámica del Molino de Sabandía. Desplázate horizontalmente para verla completa."
        className="no-bar w-full cursor-grab overflow-x-auto overscroll-x-contain active:cursor-grabbing"
        style={{ scrollSnapType: "x proximity" }}
        onPointerDown={(event) => {
          const el = trackRef.current;
          if (!el || event.pointerType === "touch") return;
          drag.current = { x: event.clientX, scroll: el.scrollLeft };
          setDragging(true);
          el.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          const el = trackRef.current;
          if (!el || !drag.current) return;
          el.scrollLeft = drag.current.scroll - (event.clientX - drag.current.x);
        }}
        onPointerUp={(event) => {
          const el = trackRef.current;
          drag.current = null;
          setDragging(false);
          if (el?.hasPointerCapture(event.pointerId)) el.releasePointerCapture(event.pointerId);
        }}
        onPointerCancel={() => {
          drag.current = null;
          setDragging(false);
        }}
      >
        <Image
          src={photo.src}
          alt={photo.alt}
          width={photo.width}
          height={photo.height}
          sizes="(min-width: 768px) 200vw, 300vw"
          className="pano-img select-none"
          draggable={false}
          style={{ scrollSnapAlign: "start", pointerEvents: dragging ? "none" : undefined }}
        />
      </div>

      <div className="container-site pt-4">
        <p className="t-label t-label-light">
          {photo.author} · {photo.year} · {photo.license}
        </p>
      </div>
    </section>
  );
}
