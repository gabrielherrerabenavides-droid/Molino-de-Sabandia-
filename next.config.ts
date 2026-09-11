import type { NextConfig } from "next";

/**
 * Cabeceras mínimas de seguridad para todas las rutas.
 * La CSP es deliberadamente acotada: sin `default-src` ni `script-src`, que con
 * Next exigirían nonce por petición (y render dinámico en todo el sitio). Cubre
 * lo que sí se puede fijar sin riesgo: marcos, plugins, base, envío de formularios
 * y subida a HTTPS. `frame-src` deja pasar los mapas de Google que embebe el sitio.
 */
const CSP = [
  "frame-src https://www.google.com https://maps.google.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  "upgrade-insecure-requests",
].join("; ");

const SECURITY_HEADERS = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "Content-Security-Policy", value: CSP },
];

const nextConfig: NextConfig = {
  // Fija la raíz del proyecto: sin esto Next avisa por los lockfiles de carpetas superiores.
  turbopack: { root: __dirname },
  poweredByHeader: false,
  images: { formats: ["image/avif", "image/webp"] },
  async headers() {
    // La constancia `/reservas/:token` recibe `Cache-Control: no-store` desde
    // `src/proxy.ts`: las cabeceras de aquí no sobrescriben las que Next fija
    // al renderizar una página dinámica.
    return [{ source: "/:path*", headers: SECURITY_HEADERS }];
  },
};

export default nextConfig;
