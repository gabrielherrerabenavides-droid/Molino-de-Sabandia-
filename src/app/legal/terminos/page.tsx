import type { Metadata } from "next";
import { Prose } from "@/components/sections/Prose";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { TERMINOS_SECTIONS, TERMINOS_ACTUALIZADO } from "@/content/legal/terminos";
import { SITE } from "@/content/site";

const DESCRIPTION =
  "Condiciones de uso del sitio web y de las solicitudes de reserva del Molino de Sabandía, conforme al Código de Protección y Defensa del Consumidor.";

export const metadata: Metadata = {
  title: "Términos y condiciones",
  description: DESCRIPTION,
  alternates: { canonical: "/legal/terminos" },
  openGraph: {
    title: `Términos y condiciones · ${SITE.name}`,
    description: DESCRIPTION,
  },
};

export default function TerminosPage() {
  return (
    <article>
      <Eyebrow tone="ocre" className="mb-4">
        Legal · Actualizado en {TERMINOS_ACTUALIZADO.toLowerCase()}
      </Eyebrow>
      <h1 className="t-display mb-6 max-w-[20ch]">Términos y condiciones</h1>
      <p className="t-lead max-w-prose-narrow mb-16">{DESCRIPTION}</p>
      <Prose sections={TERMINOS_SECTIONS} />
    </article>
  );
}
