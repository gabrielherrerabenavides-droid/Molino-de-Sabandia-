import { PageHero } from "@/components/ui/PageHero";
import { Container } from "@/components/ui/Container";
import { GalleryGrid } from "@/components/sections/GalleryGrid";
import { pageMetadata } from "@/lib/seo";

const DESCRIPTION =
  "Fotografías del Molino de Sabandía: su fachada de sillar, el mecanismo del agua, la campiña y su restauración de 1973, en fotografías de archivo de 1981.";

export const metadata = pageMetadata({
  title: "Galería",
  description: DESCRIPTION,
  path: "/galeria",
});

export default function GaleriaPage() {
  return (
    <>
      <PageHero eyebrow="Galería" title="Detente en los detalles." lead={DESCRIPTION} />

      <section className="section pt-[clamp(40px,6vw,88px)]">
        <Container>
          <GalleryGrid />
          <p className="t-body mt-12 max-w-prose-narrow text-muted">
            Fotografías de archivo publicadas en Wikimedia Commons bajo licencia de dominio público o CC BY-SA 4.0. El
            crédito, año y enlace a la fuente de cada imagen aparecen al abrirla en grande. Serán reemplazadas por
            material propio del molino cuando esté disponible.
          </p>
        </Container>
      </section>
    </>
  );
}
