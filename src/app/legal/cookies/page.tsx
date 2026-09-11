import type { Metadata } from "next";
import { Prose } from "@/components/sections/Prose";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { COOKIES_SECTIONS, COOKIES_ACTUALIZADO } from "@/content/legal/cookies";
import { SITE } from "@/content/site";

const DESCRIPTION = "Qué cookies y almacenamiento local usa el sitio del Molino de Sabandía, y cómo puedes desactivarlos.";

export const metadata: Metadata = {
  title: "Política de cookies",
  description: DESCRIPTION,
  alternates: { canonical: "/legal/cookies" },
  openGraph: {
    title: `Política de cookies · ${SITE.name}`,
    description: DESCRIPTION,
  },
};

export default function CookiesPage() {
  return (
    <article>
      <Eyebrow tone="ocre" className="mb-4">
        Legal · Actualizado en {COOKIES_ACTUALIZADO.toLowerCase()}
      </Eyebrow>
      <h1 className="t-display mb-6 max-w-[16ch]">Política de cookies</h1>
      <p className="t-lead max-w-prose-narrow mb-16">{DESCRIPTION}</p>
      <Prose sections={COOKIES_SECTIONS} />
    </article>
  );
}
