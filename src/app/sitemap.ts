import type { MetadataRoute } from "next";
import { SITE } from "@/content/site";
import { RESERVATIONS_ENABLED } from "@/lib/features";
import { EXPLORE_PATHS } from "@/content/explora";

/**
 * Rutas públicas del sitio. Sin `lastModified`: un `new Date()` en cada build
 * marcaría todas las páginas como modificadas hoy, lo que es falso y hace que
 * los buscadores dejen de fiarse del dato. Las constancias por token y el área
 * de administración no se listan (son noindex y están en robots.txt).
 */
const ROUTES = [
  "",
  "/historia",
  "/visita",
  "/galeria",
  "/eventos",
  ...(RESERVATIONS_ENABLED ? ["/reservas"] : []),
  "/contacto",
  "/legal/privacidad",
  "/legal/terminos",
  "/legal/cookies",
  "/libro-de-reclamaciones",
  ...EXPLORE_PATHS.map((slug) => `/explora/${slug}`),
];

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map((route) => ({ url: `${SITE.url}${route}` }));
}
