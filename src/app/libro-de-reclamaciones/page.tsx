import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";
import { ReclamacionForm } from "@/components/sections/ReclamacionForm";
import { SITE } from "@/content/site";

const DESCRIPTION =
  "Libro de Reclamaciones del Molino de Sabandía, conforme al D.S. N.º 011-2011-PCM y al D.S. N.º 101-2022-PCM.";

export const metadata: Metadata = {
  title: "Libro de reclamaciones",
  description: DESCRIPTION,
  alternates: { canonical: "/libro-de-reclamaciones" },
  openGraph: {
    title: `Libro de reclamaciones · ${SITE.name}`,
    description: DESCRIPTION,
  },
};

export default function LibroDeReclamacionesPage() {
  return (
    <div className="pt-[calc(var(--header-h)+clamp(40px,7vw,96px))] pb-[clamp(64px,10vw,140px)]">
      <Container>
        <div className="max-w-prose-narrow">
          <Reveal>
            <Eyebrow tone="ocre" className="mb-4">
              Reclamaciones
            </Eyebrow>
            <h1 className="t-display mb-8 max-w-[18ch]">Libro de Reclamaciones</h1>
            <dl className="mb-10 space-y-1">
              <div>
                <dt className="t-label mr-2 inline">Razón social:</dt>
                <dd className="t-body inline text-volcan-700">{SITE.legalName}</dd>
              </div>
              <div>
                <dt className="t-label mr-2 inline">RUC:</dt>
                <dd className="t-body inline text-volcan-700">[por completar]</dd>
              </div>
              <div>
                <dt className="t-label mr-2 inline">Domicilio:</dt>
                <dd className="t-body inline text-volcan-700">{SITE.address.full}</dd>
              </div>
            </dl>
          </Reveal>
          <Reveal as="div" className="mb-12 space-y-4 border-y border-sillar-300 py-8">
            <p className="t-body text-volcan-700">
              La formulación del reclamo no impide acudir a otras vías de solución de controversias ni es requisito
              previo para interponer una denuncia ante el INDECOPI.
            </p>
            <p className="t-body text-volcan-700">
              El proveedor debe dar respuesta al reclamo o queja en un plazo no mayor a quince (15) días hábiles, el
              cual es improrrogable.
            </p>
          </Reveal>
        </div>

        <div className="max-w-prose-narrow">
          <ReclamacionForm />
        </div>
      </Container>
    </div>
  );
}
