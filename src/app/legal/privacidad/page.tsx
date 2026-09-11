import type { Metadata } from "next";
import { Prose } from "@/components/sections/Prose";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { PRIVACIDAD_SECTIONS, PRIVACIDAD_ACTUALIZADO } from "@/content/legal/privacidad";
import { SITE } from "@/content/site";

const DESCRIPTION =
  "Cómo el Molino de Sabandía recoge, usa y protege tus datos personales, conforme a la Ley N.º 29733 de Protección de Datos Personales.";

export const metadata: Metadata = {
  title: "Política de privacidad",
  description: DESCRIPTION,
  alternates: { canonical: "/legal/privacidad" },
  openGraph: {
    title: `Política de privacidad · ${SITE.name}`,
    description: DESCRIPTION,
  },
};

export default function PrivacidadPage() {
  return (
    <article>
      <Eyebrow tone="ocre" className="mb-4">
        Legal · Actualizado en {PRIVACIDAD_ACTUALIZADO.toLowerCase()}
      </Eyebrow>
      <h1 className="t-display mb-6 max-w-[18ch]">Política de privacidad</h1>
      <p className="t-lead max-w-prose-narrow mb-16">{DESCRIPTION}</p>
      <Prose sections={PRIVACIDAD_SECTIONS} />
    </article>
  );
}
