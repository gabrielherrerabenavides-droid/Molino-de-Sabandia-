import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { pageMetadata } from "@/lib/seo";
import { EDITORIAL_TOPICS, EXPLORE_PATHS, HALL_OF_FAME } from "@/content/explora";

type Props = PageProps<"/explora/[slug]">;

export function generateStaticParams() {
  return EXPLORE_PATHS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const topic = EDITORIAL_TOPICS.find((item) => item.slug === slug);
  if (topic) return pageMetadata({ title: topic.navLabel, description: topic.lead, path: `/explora/${slug}` });
  if (slug === HALL_OF_FAME.slug) {
    return pageMetadata({ title: HALL_OF_FAME.navLabel, description: HALL_OF_FAME.lead, path: `/explora/${slug}` });
  }
  return {};
}

function PhotoPanel({ photo, note }: { photo: (typeof EDITORIAL_TOPICS)[number]["hero"]; note?: string }) {
  return (
    <figure className="min-w-0">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-sillar-200">
        <Image src={photo.src} alt={photo.alt} fill sizes="(min-width: 1024px) 50vw, 100vw" className="photo-grade object-cover" />
      </div>
      <figcaption className="mt-4 flex flex-wrap justify-between gap-2">
        <span className="t-caption">{photo.caption}</span>
        <span className="t-label">{photo.author} · {photo.year}</span>
      </figcaption>
      {note && <p className="mt-3 text-sm leading-relaxed text-muted">{note}</p>}
    </figure>
  );
}

function HallOfFamePage() {
  return (
    <>
      <PageHero eyebrow={HALL_OF_FAME.eyebrow} title={HALL_OF_FAME.title} lead={HALL_OF_FAME.lead} />
      <section className="section pt-[clamp(40px,6vw,88px)]">
        <Container>
          <Reveal className="mb-10 grid gap-6 border-t border-sillar-300 pt-7 md:grid-cols-[1fr_2fr]">
            <p className="t-label text-ocre-500">La colección</p>
            <p className="t-lead max-w-[52ch]">Cada toro tendrá su ficha: nombre, fotografía real, procedencia y trayectoria. Este diseño muestra cómo quedará el salón cuando recibamos esos datos.</p>
          </Reveal>
          <div className="grid gap-7 md:grid-cols-2">
            {HALL_OF_FAME.bulls.map((bull) => (
              <Reveal as="section" key={bull.id} className="overflow-hidden bg-volcan-950 text-sillar-50">
                <div className="relative aspect-[4/5] overflow-hidden">
                  <Image src={bull.image} alt={`Retrato referencial de un toro de ${bull.coat.toLowerCase()}`} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
                  <span className="absolute top-4 left-4 bg-sillar-50 px-3 py-2 text-xs font-semibold tracking-[0.15em] text-volcan-950 uppercase">Imagen referencial</span>
                  <span className="absolute right-4 bottom-1 text-[clamp(4rem,12vw,9rem)] leading-none font-bold tracking-[-0.08em] text-sillar-50/70" aria-hidden="true">{bull.id}</span>
                </div>
                <div className="p-[clamp(20px,3vw,40px)]">
                  <p className="t-label t-label-ocre-300">Ficha del ejemplar · {bull.id}</p>
                  <h2 className="mt-3 text-[clamp(1.8rem,3vw,3rem)] font-semibold tracking-tight">Nombre por confirmar</h2>
                  <div className="mt-7 grid grid-cols-2 border-t border-sillar-50/20 text-sm sm:grid-cols-3">
                    {[
                      ["Procedencia", "Por confirmar"],
                      ["Edad", "Por confirmar"],
                      ["Pelaje", "Por confirmar"],
                    ].map(([label, value]) => (
                      <div key={label} className="border-b border-sillar-50/20 py-4 pr-3">
                        <p className="t-label t-label-light">{label}</p>
                        <p className="mt-2 text-sillar-50">{value}</p>
                      </div>
                    ))}
                  </div>
                  <p className="mt-5 text-sm leading-relaxed text-sillar-50/70">Trayectoria, hitos y una breve historia de este toro se añadirán cuando el cliente proporcione la información.</p>
                </div>
              </Reveal>
            ))}
          </div>
          <p className="t-body mt-8 max-w-prose-narrow text-muted">Los retratos de esta maqueta fueron generados como referencia visual; no representan a los toros reales del molino.</p>
        </Container>
      </section>
    </>
  );
}

export default async function ExploraPage({ params }: Props) {
  const { slug } = await params;
  if (slug === HALL_OF_FAME.slug) return <HallOfFamePage />;
  const topic = EDITORIAL_TOPICS.find((item) => item.slug === slug);
  if (!topic) notFound();

  return (
    <>
      <PageHero eyebrow={topic.eyebrow} title={topic.title} lead={topic.lead} image={topic.hero} />
      {topic.sections.map((section, index) => (
        <section key={section.eyebrow} className={`section border-t border-sillar-200 ${index % 2 ? "sillar-pattern" : ""}`}>
          <Container className="grid items-center gap-[clamp(32px,5vw,80px)] lg:grid-cols-2">
            <Reveal className={index % 2 ? "lg:order-2" : ""}>
              <Eyebrow tone="ocre">{section.eyebrow}</Eyebrow>
              <h2 className="t-h2 mt-4 max-w-[19ch]">{section.title}</h2>
              <div className="mt-6 max-w-prose-narrow space-y-4">
                {section.paragraphs.map((paragraph) => <p key={paragraph} className="t-body text-volcan-700">{paragraph}</p>)}
              </div>
              {topic.slug === "tecnologia-hidraulica" && index === 1 && (
                <Link href="/#agua" className="btn btn-ghost mt-8">Explorar el mecanismo</Link>
              )}
            </Reveal>
            {section.photo && <Reveal className={index % 2 ? "lg:order-1" : ""}><PhotoPanel photo={section.photo} note={section.note} /></Reveal>}
          </Container>
        </section>
      ))}
      <section className="section border-t border-sillar-200 bg-volcan-950 text-sillar-50">
        <Container className="flex flex-col items-start gap-6">
          <Eyebrow tone="light">Sigue explorando</Eyebrow>
          <h2 className="t-h2 max-w-[18ch]">El molino se descubre en persona.</h2>
          <Link href="/visita" className="btn btn-light">Prepara tu visita</Link>
        </Container>
      </section>
    </>
  );
}
