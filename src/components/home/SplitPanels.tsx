import Image from "next/image";
import { PHOTOS } from "@/content/site";
import { Reveal, RevealItem } from "@/components/ui/Reveal";

const PANELS = [
  { photo: PHOTOS.arboles, caption: "Un refugio entre árboles" },
  { photo: PHOTOS.escalera, caption: "Piedra que sube hacia el agua" },
] as const;

export function SplitPanels() {
  return (
    <section aria-label="El conjunto" className="bg-volcan-950">
      <Reveal stagger={0.12} className="split">
        {PANELS.map(({ photo, caption }) => (
          <RevealItem as="figure" key={photo.src} className="hover-zoom relative isolate overflow-hidden">
            <div className="relative aspect-4/5 w-full bg-volcan-800 sm:aspect-3/2 lg:aspect-4/5">
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="photo-grade object-cover"
              />
              <div aria-hidden="true" className="absolute inset-0 bg-linear-to-t from-volcan-950/75 via-volcan-950/10 to-transparent" />
            </div>
            <figcaption className="absolute inset-x-0 bottom-0 p-[clamp(18px,2.6vw,40px)]">
              <p className="t-caption text-sillar-50">{caption}</p>
              <p className="t-label t-label-light mt-2">
                {photo.author} · {photo.year}
              </p>
            </figcaption>
          </RevealItem>
        ))}
      </Reveal>
    </section>
  );
}
