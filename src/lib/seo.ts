import type { Metadata } from "next";
import { SITE } from "@/content/site";

/**
 * Metadata completa por página. Next NO hereda `openGraph` del layout cuando la página define el suyo,
 * así que cada página debe pasar por aquí para conservar og:type, og:url, og:site_name e imagen.
 */
export function pageMetadata(opts: {
  title: string;
  description: string;
  /** Ruta absoluta desde la raíz, p. ej. "/historia". */
  path: string;
  /** Imagen OG (1200×630 recomendada). Por defecto /og.jpg. */
  image?: { url: string; width: number; height: number; alt: string };
  noindex?: boolean;
}): Metadata {
  const image = opts.image ?? { url: "/og.jpg", width: 1200, height: 630, alt: "Fachada de sillar del Molino de Sabandía" };
  return {
    title: opts.title,
    description: opts.description,
    alternates: { canonical: opts.path },
    openGraph: {
      type: "website",
      locale: "es_PE",
      siteName: SITE.name,
      url: opts.path,
      title: `${opts.title} · ${SITE.name}`,
      description: opts.description,
      images: [image],
    },
    twitter: { card: "summary_large_image", title: `${opts.title} · ${SITE.name}`, description: opts.description, images: [image.url] },
    ...(opts.noindex ? { robots: { index: false, follow: false } } : {}),
  };
}
