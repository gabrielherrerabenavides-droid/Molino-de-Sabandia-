import type { MetadataRoute } from "next";
import { SITE } from "@/content/site";

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
  "/reservas",
  "/contacto",
  "/legal/privacidad",
  "/legal/terminos",
  "/legal/cookies",
  "/libro-de-reclamaciones",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map((route) => ({ url: `${SITE.url}${route}` }));
}
