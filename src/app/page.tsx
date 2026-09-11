import type { Metadata } from "next";
import { SITE } from "@/content/site";
import { pageMetadata } from "@/lib/seo";
import { Hero } from "@/components/home/Hero";
import { QuickLinks } from "@/components/home/QuickLinks";
import { Destacados } from "@/components/home/Destacados";
import { Manifiesto } from "@/components/home/Manifiesto";
import { SplitPanels } from "@/components/home/SplitPanels";
import { Agua } from "@/components/home/Agua";
import { HistoriaResumen } from "@/components/home/HistoriaResumen";
import { Panoramica } from "@/components/home/Panoramica";
import { EventosTeaser } from "@/components/home/EventosTeaser";
import { Visita } from "@/components/home/Visita";
import { SillarBand } from "@/components/textures/SillarBand";
import { WaterLine } from "@/components/textures/WaterLine";

/**
 * El layout define `title.template` ("%s · Molino de Sabandía"), así que la
 * portada usa `absolute` para no repetir el nombre. `pageMetadata` recibe la
 * frase sin la marca (la añade él en og:title y twitter:title) y aporta
 * canonical, og:type/url/site_name e imagen.
 */
export const metadata: Metadata = {
  ...pageMetadata({ title: SITE.tagline, description: SITE.description, path: "/" }),
  title: { absolute: `${SITE.name} — ${SITE.tagline}` },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "TouristAttraction",
  name: SITE.name,
  description: SITE.description,
  url: SITE.url,
  image: `${SITE.url}/og.jpg`,
  foundingDate: String(SITE.founded),
  address: {
    "@type": "PostalAddress",
    streetAddress: SITE.address.street,
    addressLocality: SITE.address.district,
    addressRegion: SITE.address.region,
    postalCode: SITE.address.postalCode,
    addressCountry: "PE",
  },
  geo: { "@type": "GeoCoordinates", latitude: SITE.geo.lat, longitude: SITE.geo.lng },
  openingHours: `Mo-Su ${SITE.hours.open}-${SITE.hours.close}`,
  email: SITE.contact.email || undefined,
  sameAs: [SITE.contact.facebook].filter(Boolean),
};

export default function HomePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Hero />
      <WaterLine className="h-[clamp(48px,6vw,80px)] pt-2" />
      <QuickLinks />
      <Destacados />
      <Manifiesto />
      <SplitPanels />
      <Agua />
      <SillarBand />
      <HistoriaResumen />
      <Panoramica />
      <EventosTeaser />
      <Visita />
    </>
  );
}
