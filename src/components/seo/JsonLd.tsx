import { SITE, type Photo } from "@/content/site";

/** Serializa un objeto JSON-LD dentro de un <script type="application/ld+json">. */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

const DAY_NAMES = [
  "https://schema.org/Sunday",
  "https://schema.org/Monday",
  "https://schema.org/Tuesday",
  "https://schema.org/Wednesday",
  "https://schema.org/Thursday",
  "https://schema.org/Friday",
  "https://schema.org/Saturday",
];

/** TouristAttraction + LocalBusiness combinados, con datos de SITE.*. */
export function molinoJsonLd(image?: Photo) {
  return {
    "@context": "https://schema.org",
    "@type": ["TouristAttraction", "LocalBusiness"],
    name: SITE.name,
    description: SITE.description,
    url: SITE.url,
    image: image ? `${SITE.url}${image.src}` : undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress: SITE.address.street,
      addressLocality: SITE.address.district,
      addressRegion: SITE.address.region,
      postalCode: SITE.address.postalCode,
      addressCountry: "PE",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: SITE.geo.lat,
      longitude: SITE.geo.lng,
    },
    openingHoursSpecification: SITE.hours.days.map((day) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: DAY_NAMES[day],
      opens: SITE.hours.open,
      closes: SITE.hours.close,
    })),
  };
}

export type Crumb = { name: string; url: string };

/** BreadcrumbList a partir de una lista ordenada de nombre + url absoluta o relativa. */
export function breadcrumbJsonLd(items: Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${SITE.url}${item.url}`,
    })),
  };
}
