import type { Metadata } from "next";
import { SITE } from "@/content/site";
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

export const metadata: Metadata = {
  title: { absolute: `${SITE.name} — ${SITE.tagline}` },
  description: SITE.description,
  openGraph: {
    type: "website",
    locale: "es_PE",
    url: "/",
    siteName: SITE.name,
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "Fachada de sillar del Molino de Sabandía" }],
  },
  alternates: { canonical: "/" },
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
