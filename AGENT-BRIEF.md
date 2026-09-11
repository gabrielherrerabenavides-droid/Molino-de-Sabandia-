# Instrucciones comunes para agentes constructores

Proyecto: `/Users/brunogo/Life/Amigos/gabriel/molino-de-sabandia` — Next.js 16.3.4 (App Router, `src/`, Tailwind v4, TypeScript estricto), React 19.2. Web oficial del Molino de Sabandía (Arequipa, Perú). Idioma de la UI: español de Perú.

## Antes de escribir código (obligatorio)
1. Lee `DESIGN.md` (especificación de diseño), `src/app/globals.css` (tokens y utilidades), `src/content/site.ts` (datos), `src/components/ui/*`, `src/lib/*`.
2. Esta versión de Next.js tiene cambios respecto a lo que conoces. Lee en `node_modules/next/dist/docs/01-app/01-getting-started/` los archivos relevantes para tu tarea: `03-layouts-and-pages.md`, `04-linking-and-navigating.md`, `05-server-and-client-components.md`, `07-mutating-data.md`, `12-images.md`, `14-metadata-and-og-images.md`, `15-route-handlers.md`, `16-proxy.md`. Tipos de ruta globales disponibles: `PageProps<'/ruta/[param]'>`, `LayoutProps<'/'>`. `params` y `searchParams` son Promises.
3. Librerías ya instaladas (no añadas otras): `motion` (import desde `"motion/react"`), `lenis`, `zod` v4, `@neondatabase/serverless`, `resend`, `lucide-react`, `date-fns`, `clsx`, `@playwright/test` (dev).

## Reglas
- Propiedad estricta de archivos: solo edita los archivos/carpetas de tu lista. Si necesitas un cambio en un archivo ajeno, descríbelo en tu informe final. Puedes importar todo lo que ya existe.
- Estilo: clases utilitarias de Tailwind + las clases de `globals.css` (`.t-hero`, `.t-display`, `.btn`, `.input`, `.sillar-pattern`, etc.). Colores solo de los tokens (`bg-sillar-50`, `text-volcan-900`, `text-ocre-500`, `bg-agua-500`, …). Sin colores hex sueltos en JSX.
- Movimiento: `Reveal`/`RevealItem` de `src/components/ui/Reveal.tsx` para entradas; curva `[0.22,1,0.36,1]`; solo `transform`/`opacity`. Respeta `prefers-reduced-motion`.
- Imágenes con `next/image` y `sizes` correctos; fotos en `src/content/site.ts` (`PHOTOS`).
- Accesibilidad: etiquetas en formularios, `aria-*` en controles, foco visible, contraste AA.
- Móvil primero: todo debe funcionar a 390px sin scroll horizontal; botones ≥ 44px; inputs 16px.
- Cada `page.tsx` exporta `metadata` (title, description, openGraph, alternates.canonical).
- Sin `any`, sin `console.log` en producción, sin emojis en la UI, sin bordes redondeados > 4px.
- No ejecutes `next build` (otro agente lo hará al integrar). Verifica con `npx tsc --noEmit -p .` y `npx eslint <tus-archivos>`. Solo el agente de foundation puede levantar `next dev` (puerto 3001); los demás no levantan servidor.
- Al terminar: informe breve (≤ 300 palabras): archivos creados, decisiones, TODOs, cambios que necesitas en archivos ajenos.
