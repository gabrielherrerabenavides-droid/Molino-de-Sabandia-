import Image from "next/image";
import { PHOTOS } from "@/content/site";
import { Reveal } from "@/components/ui/Reveal";

/**
 * Franja "materia real" (DESIGN.md §6.4): foto de los contrafuertes en
 * duotono a sangre con la palabra SILLAR VIVO. encima.
 */
export function SillarBand() {
  const photo = PHOTOS.contrafuertes;

  return (
    <section aria-labelledby="sillar-vivo" className="full-bleed relative isolate flex h-[60vh] min-h-[420px] items-end overflow-hidden bg-volcan-950">
      <Image
        src={photo.src}
        alt={photo.alt}
        fill
        sizes="100vw"
        className="duotone object-cover"
      />
      <div aria-hidden="true" className="absolute inset-0 bg-volcan-950/45" />
      <div aria-hidden="true" className="absolute inset-0 hero-overlay" />

      <div className="container-site relative z-10 pb-[clamp(28px,5vw,64px)]">
        <Reveal>
          <h2 id="sillar-vivo" className="t-hero t-hero-band text-sillar-50">
            Sillar vivo.
          </h2>
          <p className="t-caption mt-3 text-sillar-50/80">Mucho más que una fachada</p>
        </Reveal>
      </div>

      <p className="t-label t-label-light absolute right-[var(--gutter)] bottom-[clamp(28px,5vw,64px)] z-10 hidden text-right lg:block">
        {photo.author} · {photo.year}
      </p>
    </section>
  );
}
