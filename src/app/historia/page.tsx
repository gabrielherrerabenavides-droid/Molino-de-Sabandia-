import Image from "next/image";
import Link from "next/link";
import { PageHero } from "@/components/ui/PageHero";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";
import { JsonLd, molinoJsonLd, breadcrumbJsonLd } from "@/components/seo/JsonLd";
import { pageMetadata } from "@/lib/seo";
import { PHOTOS } from "@/content/site";

const DESCRIPTION = "Desde su construcción en 1621 hasta la restauración de 1973: la historia del Molino de Sabandía, patrimonio de la campiña arequipeña.";

const HISTORY = [
  "Construido en 1621, el Molino de Sabandía es uno de los monumentos coloniales más antiguos y emblemáticos de la campiña arequipeña. Su construcción fue ordenada por el hacendado español Don García de Vargas Machuca y ejecutada por el maestro cantero Don Francisco Flores.",
  "Como dato histórico fascinante, el molino comparte exactamente su año de origen con la construcción de la actual Catedral de Arequipa, levantada tras la destrucción total del templo primitivo.",
  "Luego de siglos de esplendor abasteciendo de harina a la región, el molino cayó en el abandono. Sin embargo, en 1973, fue rescatado de sus ruinas y restaurado con absoluta fidelidad arquitectónica por el arquitecto Luis Felipe Calle.",
  "Declarado “Monumento Histórico”, el molino hoy es parte del Patrimonio Cultural de la Nación.",
] as const;

export const metadata = pageMetadata({ title: "Historia", description: DESCRIPTION, path: "/historia" });

export default function HistoriaPage() {
  return (
    <>
      <JsonLd data={molinoJsonLd(PHOTOS.historica)} />
      <JsonLd data={breadcrumbJsonLd([{ name: "Inicio", url: "/" }, { name: "Historia", url: "/historia" }])} />
      <PageHero eyebrow="Historia · 1621" title="La historia sigue en movimiento." lead={DESCRIPTION} image={PHOTOS.historica} />

      <section className="section pt-[clamp(48px,7vw,112px)]">
        <Container className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">
          <Reveal>
            <Eyebrow tone="ocre">Cuatro siglos de memoria</Eyebrow>
            <p className="mt-5 text-[clamp(3.6rem,9vw,9rem)] leading-[0.9] font-light tracking-[-0.07em] text-volcan-900">1621</p>
            <p className="t-caption mt-5 max-w-[19ch]">Un molino hecho de piedra, agua y trabajo.</p>
          </Reveal>
          <Reveal className="max-w-[70ch] space-y-6">
            {HISTORY.map((paragraph, index) => (
              <p key={paragraph} className={index === 0 ? "t-lead text-volcan-900" : "t-body text-volcan-700"}>{paragraph}</p>
            ))}
          </Reveal>
        </Container>
      </section>

      <section className="section sillar-pattern border-t border-sillar-200">
        <Container className="grid items-center gap-10 lg:grid-cols-2 lg:gap-20">
          <Reveal>
            <Eyebrow tone="ocre">El rescate · 1973</Eyebrow>
            <h2 className="t-h2 mt-4 max-w-[18ch]">Volver a darle vida a la piedra.</h2>
            <p className="t-body mt-6 max-w-prose-narrow text-volcan-700">La restauración devolvió al molino su lugar en la memoria de Arequipa. Las fotografías de archivo permiten mirar ese momento de cerca.</p>
            <Link href="/explora/400-anos-despues" className="btn btn-ghost mt-8">Ver el molino 400 años después</Link>
          </Reveal>
          <Reveal as="figure">
            <div className="relative aspect-[4/3] overflow-hidden bg-sillar-200">
              <Image src={PHOTOS.patio.src} alt={PHOTOS.patio.alt} fill sizes="(min-width: 1024px) 50vw, 100vw" className="photo-grade object-cover" />
            </div>
            <figcaption className="mt-4 flex flex-wrap justify-between gap-3"><span className="t-caption">{PHOTOS.patio.caption}</span><span className="t-label">{PHOTOS.patio.author} · {PHOTOS.patio.year}</span></figcaption>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
