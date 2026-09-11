# Molino de Sabandía — Especificación de diseño (fuente de verdad)

Todo agente que construya UI lee este archivo, `src/app/globals.css` y `src/content/site.ts` antes de escribir código. Si algo no está aquí, decide con el criterio "museo contemporáneo con alma arequipeña", nunca "landing genérica".

## 1. Concepto: SILLAR VIVO
Referencia principal: la web del Guggenheim Bilbao (hero cinematográfico a pantalla completa, tipografía enorme en mayúsculas y ancha, navegación mínima: hamburguesa + un CTA, píldora de estado "Abierto hasta las 17:00 h", paneles partidos 50/50 con pies de foto en serif itálica). Sobre esa base, la identidad de Arequipa: el sillar (piedra volcánica blanca), el agua del manantial, la campiña y el Misti. La web debe sentirse tallada en piedra clara con luz de altura, no "template".

Tres palabras: **piedra · agua · memoria**.

## 2. Paleta (tokens en globals.css, no inventar colores)
| Token | Hex | Uso |
|---|---|---|
| sillar-50 | #f7f5ef | fondo base de la web (papel/sillar) |
| sillar-100 | #efece3 | fondos alternos, tarjetas |
| sillar-200 | #e3dfd2 | bordes suaves, franjas |
| sillar-300 | #cfc9b8 | líneas, decoración |
| volcan-950 | #121311 | fondo oscuro (hero overlay, footer, menú) |
| volcan-900 | #1b1c19 | texto principal (ink) |
| volcan-700 | #3a3b36 | texto secundario oscuro |
| muted | #63655c | texto secundario en claro |
| ocre-500 | #8a6a34 | acento tierra (eyebrows, links hover, detalles) |
| ocre-300 | #c9a568 | dorado discreto sobre fondos oscuros |
| agua-500 | #3f6f7a | acento agua (motivo de líneas, focus ring, iconos) |
| agua-700 | #2b4d55 | hover del acento agua |
| campina-500 | #5d7a3e | solo el punto de "Abierto" |
| alerta | #b5533a | errores de formulario, "Cerrado" |

Regla: 90 % de la pantalla es sillar-50/volcan-950 + texto. Los acentos son escasos. Nada de degradados de colores saturados, nada de morados/azules genéricos, ningún glassmorphism.

## 3. Tipografía
- Display y UI: **Archivo** (variable, eje `wdth`). Titulares hero: mayúsculas, `font-stretch: 125%`, peso 600–700, tracking -0.02em, `clamp(2.6rem, 9vw, 9.5rem)`, line-height 0.92. Titulares de sección: `font-stretch 110%`, peso 500, `clamp(2rem, 4.5vw, 4.25rem)`, line-height 1.02, sin mayúsculas.
- Cuerpo: Archivo 400, 17px/1.6 desktop, 16px móvil, máximo 62 caracteres por línea (`max-w-prose-narrow`).
- Serif de acento: **Playfair Display** itálica para pies de foto, citas, eyebrows narrativos ("La piedra que aprendió a moler.") y el subtítulo de hero. Nunca para párrafos largos.
- Etiquetas/metadata: Archivo 500, 12–13px, mayúsculas, tracking 0.14em, color muted u ocre.
- Números grandes (1621, 9 km): Archivo 300, `font-stretch 125%`.

Clases utilitarias listas en globals.css: `.t-hero`, `.t-display`, `.t-h2`, `.t-h3`, `.t-lead`, `.t-body`, `.t-label`, `.t-caption`, `.t-serif-i`.

## 4. Retícula y espaciado
- Gutter fluido `--gutter: clamp(20px, 5vw, 88px)`; contenedor máximo 1440px (`.container-site`). Secciones: padding vertical `clamp(72px, 10vw, 160px)`.
- Paneles partidos 50/50 en desktop (`.split`), apilados en móvil con la imagen arriba. Imágenes siempre `aspect-ratio` fijo + `object-cover`.
- Header fijo de 72px (64px móvil): transparente sobre el hero (texto blanco), se vuelve sillar-50 con línea inferior al hacer scroll (texto ink). Contenido: wordmark "MOLINO DE SABANDÍA" a la izquierda, a la derecha hamburguesa (tres líneas 28px, animación a X) y CTA "Reservar" (en móvil solo icono + hamburguesa).
- Menú: overlay a pantalla completa volcan-950 con las secciones en `.t-display` blanco (stagger 60 ms), a la derecha una foto y datos de contacto/horario; cerrar con X y con Escape; bloquea scroll.
- Footer: volcan-950 con textura de sillar oscuro, wordmark enorme recortado abajo, columnas: Visita / Historia / Eventos / Legal, dirección, horario, redes, créditos de fotografías.

## 5. Movimiento (biblioteca `motion`, import `from "motion/react"`)
- Curva casa: `[0.22, 1, 0.36, 1]`. Duraciones: micro 0.25s, reveal 0.8s, transiciones de página 0.6s.
- Reveal al entrar en viewport: opacidad 0→1 + translateY 24→0, `once: true`, `margin: "-10% 0px"`, stagger 0.08 entre hijos. Imágenes: `scale 1.06→1` con `clip-path` opcional.
- Hero: Ken Burns lento sobre la foto (scale 1→1.08 en 22s, alternando), overlay `linear-gradient(180deg, rgba(18,19,17,.35), rgba(18,19,17,.15) 40%, rgba(18,19,17,.75))`, titular entra por palabras (stagger 50 ms) después de 200 ms. Botón "Pausar movimiento" abajo a la derecha (icono ‖) que congela el Ken Burns. Respeta `prefers-reduced-motion` (sin Ken Burns, reveals solo opacidad).
- Scroll suave con Lenis (`lerp 0.1`) solo en pointer fino (desktop); en táctil desactivado. Nunca scroll-jacking.
- Transición de página: `src/app/template.tsx` con un fundido de 0.45s + ligero translateY; el header no parpadea.
- Hover en imágenes: scale 1.04 en 1.2s; pies de foto suben 8px. Enlaces: subrayado que crece desde la izquierda (`.link-line`).
- Todo animable con `transform`/`opacity` únicamente. 60 fps en móvil es un requisito.

## 6. Texturas de sillar (obligatorias, sutiles)
1. **Grano**: overlay fijo con `feTurbulence` (SVG en data URI), opacidad 0.05–0.07, `mix-blend-mode: multiply` sobre claro y `overlay` sobre oscuro, `pointer-events: none`. Clase `.grain` en body.
2. **Aparejo de sillar**: patrón SVG de bloques rectangulares con juntas desfasadas (hiladas de 2 alturas, ligeras variaciones de tono ±3 % y bordes con 1px de sombra). Clase `.sillar-pattern` (claro) y `.sillar-pattern-dark` (oscuro). Se usa a contraste muy bajo (≤5 %) como fondo de Historia, Visita, footer y bandas separadoras.
3. **Junta tallada**: separadores `.stone-rule` = 1px sillar-300 + 1px blanco debajo (bisel de piedra).
4. **Materia real**: la foto `contrafuertes-1981.webp` en una franja full-bleed con tratamiento duotono (filtro sepia/contraste) y la palabra "SILLAR VIVO." en `.t-hero` encima, como en la referencia.
5. Motivo del agua: línea SVG fina de agua-500 con `stroke-dasharray` animada muy lenta que conecta secciones (Hero → Historia → Visita). Sutil.

## 7. Mapa de páginas y secciones
- `/` Inicio: Hero (fachada-jardines, píldora "Abierto hasta las 17:00 h" según hora de Lima) → Quick links 01/02/03 (Historia, Sigue el agua, Tu visita) → Destacados (carrusel 3 tarjetas grandes con flechas) → Manifiesto "Un lugar, muchas historias" → Paneles partidos (dos fotos con pie en serif itálica) → El corazón del molino (diagrama del agua) → Franja SILLAR VIVO → Historia resumida con línea de tiempo 1621/1972/1973/Hoy → Panorámica (foto panoramica-sabandia con scroll horizontal por arrastre) → Eventos (CTA a reservas) → Tu visita (horarios, cómo llegar, mapa) → Footer.
- `/historia`, `/visita`, `/galeria`, `/eventos`, `/reservas` (+ `/reservas/[codigo]`), `/contacto`, `/legal/privacidad`, `/legal/terminos`, `/legal/cookies`, `/libro-de-reclamaciones`, `/admin/reservas`, `not-found`.
- Cada página interior abre con un "hero corto": eyebrow + `.t-display` + párrafo lead sobre sillar-50, con una imagen full-bleed 16:7 debajo.

## 8. Móvil (obligatorio, 390px de referencia)
- Sin scroll horizontal. Titulares hero ≥ 2.6rem pero nunca desbordan (`overflow-wrap: anywhere` en el wordmark). Botones ≥ 44px de alto. Formularios con inputs de 16px (evita zoom en iOS). Menú overlay con scroll interno. Imágenes con `sizes` correctos. Header 64px. Píldora de estado bajo el titular, no superpuesta a los controles.
- Probar en 390×844 y 1440×900 con Playwright antes de dar por terminado.

## 9. Voz y contenido
Español de Perú, tuteo cálido, frases cortas. Nunca "¡Bienvenidos a nuestra página web!". Los datos operativos (horarios, tarifas, teléfono) salen de `src/content/site.ts`; si un dato es provisional, se muestra igual pero marcado en el archivo con `// TODO confirmar`. Toda página lleva `metadata` propia (title, description, openGraph).

## 10. No hacer
Sin emojis en la UI. Sin iconos gigantes de colores. Sin sombras azuladas. Sin bordes redondeados grandes (radio máximo 4px; los botones son rectos). Sin carruseles automáticos. Sin loaders innecesarios. Sin `any` en TypeScript. Sin `console.log` en producción.
