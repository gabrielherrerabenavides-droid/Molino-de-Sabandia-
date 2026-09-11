import type { MetadataRoute } from "next";
import { SITE } from "@/content/site";

/** Rutas públicas del sitio. Las páginas de constancia ([codigo]) son noindex y no se listan aquí. */
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
  const lastModified = new Date();
  return ROUTES.map((route) => ({
    url: `${SITE.url}${route}`,
    lastModified,
  }));
}
