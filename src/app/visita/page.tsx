import { PageHero } from "@/components/ui/PageHero";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";
import { ServiceList } from "@/components/sections/ServiceList";
import { VisitInfo } from "@/components/sections/VisitInfo";
import { JsonLd, molinoJsonLd, breadcrumbJsonLd } from "@/components/seo/JsonLd";
import { pageMetadata } from "@/lib/seo";
import { PHOTOS } from "@/content/site";

const TITLE = "Te esperamos en Sabandía.";
const DESCRIPTION =
  "Horarios, tarifas, cómo llegar y todo lo que necesitas para planear tu visita al Molino de Sabandía, en la campiña de Arequipa.";

export const metadata = pageMetadata({
  title: "Tu visita",
  description: DESCRIPTION,
  path: "/visita",
});

export default function VisitaPage() {
  return (
    <>
      <JsonLd data={molinoJsonLd(PHOTOS.camino)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Inicio", url: "/" },
          { name: "Tu visita", url: "/visita" },
        ])}
      />

      <PageHero eyebrow="Tu visita" title={TITLE} lead={DESCRIPTION} image={PHOTOS.camino} />

      <section className="section pt-[clamp(56px,8vw,120px)]">
        <Container>
          <Reveal>
            <Eyebrow tone="ocre">Qué puedes vivir aquí</Eyebrow>
            <h2 className="t-h2 mt-3 mb-10 max-w-[18ch]">Un solo lugar, varias historias</h2>
          </Reveal>
          <ServiceList />
        </Container>
      </section>

      <VisitInfo />
    </>
  );
}
