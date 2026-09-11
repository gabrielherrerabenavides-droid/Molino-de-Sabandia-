"use client";
import { useState } from "react";
import Image from "next/image";
import { PHOTOS } from "@/content/site";
import { Reveal, RevealItem } from "@/components/ui/Reveal";
import { Lightbox } from "@/components/sections/Lightbox";

const photos = Object.values(PHOTOS);

/**
 * Galería masonry (3 columnas desktop, 2 tablet, 1 móvil) que respeta el
 * aspect ratio de cada foto. Caption + autor·año visibles siempre en móvil,
 * al hover/focus en desktop. Abre Lightbox al hacer clic (DESIGN.md §7).
 */
export function GalleryGrid() {
  const [index, setIndex] = useState<number | null>(null);

  return (
    <>
      <Reveal
        as="ul"
        stagger={0.06}
        className="columns-1 gap-6 sm:columns-2 lg:columns-3 [&>li]:mb-6 [&>li]:break-inside-avoid"
      >
        {photos.map((photo, i) => (
          <RevealItem as="li" key={photo.src}>
            <button
              type="button"
              onClick={() => setIndex(i)}
              className="group relative block w-full overflow-hidden bg-sillar-200 text-left"
              aria-label={`Ver en grande: ${photo.caption}`}
            >
              <span
                className="relative block w-full"
                style={{ aspectRatio: String(Math.min(Math.max(photo.width / photo.height, 0.65), 16 / 9)) }}
              >
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="photo-grade object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
                />
              </span>
              <span className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col gap-0.5 bg-gradient-to-t from-volcan-950/80 to-transparent p-4 pt-10 opacity-100 transition-all duration-300 md:translate-y-2 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 md:group-focus-visible:translate-y-0 md:group-focus-visible:opacity-100">
                <span className="t-caption !text-[1.05rem] text-sillar-50">{photo.caption}</span>
                <span className="t-label !text-sillar-300">
                  {photo.author} · {photo.year}
                </span>
              </span>
            </button>
          </RevealItem>
        ))}
      </Reveal>

      <Lightbox photos={photos} index={index} onClose={() => setIndex(null)} onIndexChange={setIndex} />
    </>
  );
}
