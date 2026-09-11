import Image from "next/image";
import { PageHero } from "@/components/ui/PageHero";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";
import { Timeline } from "@/components/sections/Timeline";
import { JsonLd, molinoJsonLd, breadcrumbJsonLd } from "@/components/seo/JsonLd";
import { pageMetadata } from "@/lib/seo";
import { PHOTOS } from "@/content/site";
import { CHAPTERS, SOURCES } from "@/content/historia";

const TITLE = "Cuatro siglos. Una historia por descubrir.";
const DESCRIPTION =
  "Del contrato de 1621 a la restauración de 1973: la historia del Molino de Sabandía, el único molino colonial de Arequipa que sigue moliendo con la fuerza del agua.";

export const metadata = pageMetadata({
  title: "Historia",
  description: DESCRIPTION,
  path: "/historia",
});

export default function HistoriaPage() {
  return (
    <>
      <JsonLd data={molinoJsonLd(PHOTOS.historica)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Inicio", url: "/" },
          { name: "Historia", url: "/historia" },
        ])}
      />

      <PageHero eyebrow="Historia" title={TITLE} lead={DESCRIPTION} image={PHOTOS.historica} />

      <div className="section pt-[clamp(56px,8vw,120px)]">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[220px_1fr] lg:gap-16">
            <aside className="hidden lg:block">
              <nav aria-label="Capítulos" className="sticky top-[calc(var(--header-h)+24px)]">
                <p className="t-label mb-4">Capítulos</p>
                <ul className="space-y-3 border-l border-sillar-300 pl-4">
                  {CHAPTERS.map((chapter) => (
                    <li key={chapter.id}>
                      <a href={`#${chapter.id}`} className="t-body text-muted transition-colors hover:text-volcan-900">
                        {chapter.navLabel}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </aside>

            <div className="space-y-20">
              {CHAPTERS.map((chapter) => (
                <section key={chapter.id} id={chapter.id} className="scroll-mt-[calc(var(--header-h)+24px)]">
                  <Reveal>
                    <Eyebrow tone="ocre">{chapter.eyebrow}</Eyebrow>
                    <h2 className="t-h2 mt-3 mb-6 max-w-[22ch]">{chapter.title}</h2>
                    <div className="max-w-prose-narrow space-y-4">
                      {chapter.paragraphs.map((paragraph, index) => (
                        <p key={index} className="t-body text-volcan-700">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </Reveal>

                  {chapter.photo && (
                    <Reveal className="mt-10">
                      <figure className="relative aspect-[16/10] w-full overflow-hidden bg-sillar-200 sm:aspect-[16/7]">
                        <Image
                          src={chapter.photo.src}
                          alt={chapter.photo.alt}
                          fill
                          sizes="(min-width: 1024px) 70vw, 100vw"
                          className="photo-grade object-cover"
                        />
                      </figure>
                      <figcaption className="mt-4 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                        <span className="t-caption">{chapter.photo.caption}</span>
                        <span className="t-label">
                          {chapter.photo.author} · {chapter.photo.year}
                        </span>
                      </figcaption>
                    </Reveal>
                  )}
                </section>
              ))}

              <section className="border-t border-sillar-300 pt-10">
                <p className="t-label mb-4">Fuentes</p>
                <ul className="max-w-prose-narrow space-y-2">
                  {SOURCES.map((source) => (
                    <li key={`${source.label}-${source.detail}`} className="t-body text-muted">
                      {source.label} — {source.detail}
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          </div>
        </Container>
      </div>

      <section className="section sillar-pattern border-t border-sillar-200">
        <Container>
          <Reveal>
            <Eyebrow tone="ocre">Línea de tiempo</Eyebrow>
            <h2 className="t-h2 mt-3 mb-10 max-w-[18ch]">Cuatro siglos, cuatro momentos</h2>
          </Reveal>
          <Timeline />
        </Container>
      </section>
    </>
  );
}
