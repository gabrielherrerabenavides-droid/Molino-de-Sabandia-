import Image from "next/image";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";
import type { Photo } from "@/content/site";

/** Cabecera de páginas interiores (DESIGN.md §7). */
export function PageHero({
  eyebrow,
  title,
  lead,
  image,
  children,
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  image?: Photo;
  children?: React.ReactNode;
}) {
  return (
    <header className="pt-[calc(var(--header-h)+clamp(40px,8vw,120px))]">
      <div className="container-site pb-[clamp(40px,6vw,88px)]">
        <Reveal>
          {eyebrow && (
            <Eyebrow tone="ocre" className="mb-5">
              {eyebrow}
            </Eyebrow>
          )}
          <h1 className="t-display max-w-[18ch]">{title}</h1>
          {lead && <p className="t-lead max-w-prose-narrow mt-6">{lead}</p>}
          {children}
        </Reveal>
      </div>
      {image ? (
        <figure className="relative w-full overflow-hidden bg-sillar-200 aspect-16/9 md:aspect-16/7">
          <Image src={image.src} alt={image.alt} fill priority sizes="100vw" className="photo-grade object-cover" />
          <figcaption className="absolute right-[var(--gutter)] bottom-4 hidden lg:block">
            <span className="t-label t-label-light">
              {image.author} · {image.year}
            </span>
          </figcaption>
        </figure>
      ) : (
        <div className="container-site">
          <hr className="stone-rule" />
        </div>
      )}
    </header>
  );
}
