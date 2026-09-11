# Molino de Sabandía

Web oficial del **Molino de Sabandía** (Arequipa, Perú): molino colonial de 1621,
Patrimonio Cultural de la Nación y único de la región que sigue moliendo con la
fuerza del agua. El sitio cuenta la historia del lugar, orienta la visita y
permite **solicitar una fecha para eventos** (bodas, sesiones fotográficas,
quinceañeros, eventos corporativos y visitas en grupo).

- **Stack**: Next.js 16 (App Router, `src/`), React 19, TypeScript estricto,
  Tailwind v4, `motion`, `zod`, `date-fns`, Resend, Neon Postgres.
- **Idioma**: español de Perú. Toda la interfaz y los correos están en español.
- **Diseño**: la fuente de verdad es [`DESIGN.md`](./DESIGN.md); los tokens y las
  utilidades viven en `src/app/globals.css` y los datos en `src/content/site.ts`.

## Puesta en marcha

Requisitos: Node.js 20 o superior (probado con Node 24) y npm.

```bash
npm install
cp .env.example .env.local   # opcional: sin variables el sitio ya arranca
npm run dev                  # http://localhost:3000
```

Otros scripts:

```bash
npm run build     # compilación de producción
npm run start     # sirve la compilación
npm run lint      # eslint
npx tsc --noEmit -p .   # comprobación de tipos
```

Sin `DATABASE_URL` las reservas se guardan en `.data/reservas.json` (ignorado por
git) y sin `RESEND_API_KEY` los correos se omiten y se registran en consola: se
puede desarrollar el flujo completo sin ningún servicio externo.

## Variables de entorno

Están documentadas una a una en [`.env.example`](./.env.example). Resumen:

| Variable | Para qué sirve | Si falta |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | URL canónica, Open Graph y enlaces de los correos | Se usa `https://molinodesabandia.com` |
| `DATABASE_URL` (o `POSTGRES_URL`) | Neon / Vercel Postgres para las reservas | Se guarda en `.data/reservas.json` (o `/tmp` en producción: efímero) |
| `RESEND_API_KEY` | Envío de correos con Resend | No se envía ningún correo y nada falla |
| `MAIL_FROM` | Remitente verificado en Resend | `Molino de Sabandía <no-reply@molinodesabandia.com>` |
| `RESERVAS_NOTIFY_EMAIL` | Buzón que recibe las nuevas solicitudes | `SITE.contact.email` de `src/content/site.ts` |
| `ADMIN_USER` / `ADMIN_PASSWORD` | Acceso HTTP Basic a `/admin` y `/api/admin` | `/admin` responde 503 con «Configura ADMIN_USER y ADMIN_PASSWORD» |

## Reservas

El módulo de reservas cubre todo el circuito: solicitud pública, correos,
consulta por código y gestión interna.

### Circuito

1. **`/reservas`** — asistente de cuatro pasos (evento, fecha y franja, datos,
   confirmación). Valida en el cliente y en el servidor con el mismo esquema zod.
2. **`POST /api/reservas`** — valida, comprueba disponibilidad, guarda la
   solicitud con estado `pendiente` y envía dos correos: acuse de recibo al
   cliente («Recibimos tu solicitud de reserva · MS-…») y aviso al molino
   («Nueva solicitud de reserva: …»).
3. **`/reservas/<código>`** — página de seguimiento con el código, el estado y el
   resumen. No se indexa (`robots: noindex`).
4. **`/admin/reservas`** — listado interno con filtros, exportación CSV y las
   acciones Confirmar / Cancelar / Volver a pendiente. Al cambiar el estado se
   avisa al cliente por correo.

### Reglas de disponibilidad

Viven en `src/lib/reservas/availability.ts` (funciones puras, sin dependencias):

- Solo se aceptan fechas a partir de **hoy + 3 días**, en hora de Lima.
- Una reserva **confirmada** de día completo bloquea todas las franjas de ese día.
- Una reserva **confirmada** de mañana o de tarde bloquea esa franja y el día completo.
- Las **pendientes no bloquean**: el calendario las señala con un punto ocre
  («solicitado») y la confirmación va por orden de llegada.
- El aforo y las franjas permitidas salen de `EVENT_TYPES` en `src/content/site.ts`.

### Endpoints

| Método y ruta | Descripción |
|---|---|
| `POST /api/reservas` | Crea una solicitud. 5 envíos por IP cada 10 minutos, trampa antispam en el campo oculto `website`. Devuelve `201 { code }`. |
| `GET /api/reservas/disponibilidad?mes=AAAA-MM` | Disponibilidad de cada día del mes para el calendario. |
| `GET /api/admin/reservas` | Listado en JSON. Filtros `?status=` y `?mes=`. Con `?format=csv` descarga el CSV. |
| `PATCH /api/admin/reservas/<id>` | Cambia `status` y `adminNotes`. Avisa al cliente por correo cuando el estado cambia. |

Las rutas `/admin/**` y `/api/admin/**` están protegidas con HTTP Basic desde
`src/proxy.ts`.

### Datos personales

El formulario exige consentimiento expreso (Ley 29733) y aceptación de los
términos. Se guardan IP y navegador de la solicitud como prueba del
consentimiento. Los correos enlazan siempre a `/legal/privacidad`.

### Pruebas

Las reglas de disponibilidad tienen pruebas unitarias sin dependencias:

```bash
node --experimental-strip-types --test src/lib/reservas/availability.test.ts
```

(El archivo carga el módulo con `import()` dinámico porque Node exige la
extensión `.ts` y TypeScript la rechaza en un import estático.)

## Despliegue en Vercel

1. Sube el repositorio a GitHub, GitLab o Bitbucket.
2. En [vercel.com/new](https://vercel.com/new), **Import Git Repository** y elige
   el repositorio. Vercel detecta Next.js: no hay que tocar el comando de
   compilación (`next build`) ni el directorio de salida.
3. Antes del primer despliegue, añade las variables de entorno de
   [`.env.example`](./.env.example) en **Environment Variables** (al menos
   `ADMIN_USER`, `ADMIN_PASSWORD` y `NEXT_PUBLIC_SITE_URL` con el dominio real).
4. **Deploy**. Cada `push` a la rama principal despliega a producción y cada rama
   o pull request genera una vista previa.
5. En **Settings → Domains** añade el dominio definitivo y configura los DNS que
   Vercel indique.

Después de cambiar cualquier variable de entorno hay que **volver a desplegar**
(Deployments → … → Redeploy) para que surta efecto.

### Añadir Neon Postgres desde el marketplace de Vercel

Sin base de datos las reservas no sobreviven a un despliegue, así que en
producción es imprescindible.

1. En el proyecto de Vercel, pestaña **Storage** → **Create Database** (o
   **Marketplace Database Providers**) → **Neon**.
2. Acepta la conexión, elige la región más cercana (por ejemplo `us-east-1` o
   `sa-east-1`) y un plan; el gratuito basta para este volumen.
3. **Connect Project**: selecciona el proyecto y los entornos (Production,
   Preview, Development). Vercel inyecta automáticamente `DATABASE_URL` y las
   variables relacionadas.
4. Vuelve a desplegar. `src/lib/store.ts` detecta `DATABASE_URL`, crea la tabla
   `documents` la primera vez que se usa y a partir de ahí guarda ahí las
   reservas. No hay migraciones que ejecutar.
5. Para trabajar en local contra la misma base: `vercel env pull .env.local`.

### Añadir Resend desde el marketplace de Vercel

1. Pestaña **Storage** / **Integrations** → **Marketplace** → **Resend** →
   **Install** y conéctalo al proyecto. También puedes crear la cuenta en
   [resend.com](https://resend.com) y pegar la clave a mano.
2. En Resend, **Domains** → añade el dominio del molino y crea en tu proveedor de
   DNS los registros SPF y DKIM que te indique. Sin dominio verificado solo se
   puede enviar a la dirección de prueba.
3. Copia la API key (`re_…`) en la variable `RESEND_API_KEY` y ajusta `MAIL_FROM`
   con un remitente de ese dominio.
4. Define `RESERVAS_NOTIFY_EMAIL` con el buzón que debe recibir las solicitudes.
5. Vuelve a desplegar y envía una solicitud de prueba desde `/reservas`.

## Administración

`/admin/reservas` está protegida con autenticación HTTP Basic (`src/proxy.ts`).
Configura `ADMIN_USER` y `ADMIN_PASSWORD` con una contraseña larga y única; si
falta cualquiera de las dos, la ruta responde 503 y no muestra nada. La zona no
se indexa y desde ella se pueden filtrar solicitudes, exportar el CSV y cambiar
estados.

## Estructura

```
src/
  app/                     rutas (App Router), API y páginas
    page.tsx               portada
    historia/ visita/ galeria/ eventos/ contacto/
    reservas/              asistente + /reservas/[codigo] (seguimiento)
    legal/                 privacidad, terminos, cookies
    libro-de-reclamaciones/  formulario + /[codigo] (constancia)
    admin/reservas/        listado interno (HTTP Basic)
    api/                   reservas, disponibilidad, contacto, reclamaciones, admin
    globals.css            tokens de color, tipografía y utilidades propias
    layout.tsx template.tsx not-found.tsx sitemap.ts robots.ts manifest.ts
    icon.svg favicon.ico   monograma "M" sobre sillar-50
  components/
    layout/                header, menú overlay, footer, cookies, scroll suave
    home/                  secciones de la portada
    sections/              bloques reutilizables (galería, FAQ, mapa, formularios)
    reservas/  admin/      asistente de reserva y panel interno
    ui/                    Button, Container, Eyebrow, PageHero, Reveal…
    textures/  seo/        franja de sillar, línea de agua, JSON-LD
  content/
    site.ts                DATOS DEL MOLINO (ver más abajo)
    historia.ts            capítulos y fuentes de /historia
    legal/                 textos de privacidad, términos y cookies
  lib/                     store (Neon/archivo), correo, límite de peticiones,
                           reservas (esquemas, disponibilidad, formato)
  proxy.ts                 HTTP Basic para /admin y /api/admin
public/images/             fotografías (provisionales, Wikimedia Commons)
scripts/shots.mjs          capturas con Playwright para revisión visual
```

## Fuentes de verdad

Antes de tocar nada conviene saber dónde vive cada cosa:

| Qué | Dónde |
|---|---|
| Criterio de diseño (paleta, tipografía, retícula, movimiento, texturas) | [`DESIGN.md`](./DESIGN.md) |
| Tokens de color, clases `.t-*`, `.btn`, `.input`, `.sillar-pattern`… | `src/app/globals.css` |
| Datos del molino: horarios, tarifas, contacto, fotos, tipos de evento, FAQ | `src/content/site.ts` |
| Textos largos de historia y de los documentos legales | `src/content/historia.ts`, `src/content/legal/` |
| Instrucciones que recibieron los agentes que construyeron el sitio | [`AGENT-BRIEF.md`](./AGENT-BRIEF.md) |

Regla práctica: **ningún dato operativo se escribe dentro de un componente**. Si
hace falta un dato nuevo (un teléfono, un precio, una foto), se añade a
`src/content/site.ts` y el componente lo importa.

## Datos pendientes de confirmar con el molino

Todos están marcados con `// TODO confirmar` en el código y se muestran igual en
la web (o vacíos, si no hay valor). Antes de publicar hay que repasarlos uno a
uno con la administración.

| Dato | Dónde | Estado actual |
|---|---|---|
| **Razón social** | `SITE.legalName` (`src/content/site.ts`) | "Molino de Sabandía" — provisional |
| **RUC** | `SITE.ruc` | vacío; aparece como «[por completar]» en `/legal/privacidad` y en `/libro-de-reclamaciones` |
| **Teléfono** | `SITE.contact.phone` | vacío: no se muestra el bloque de teléfono |
| **WhatsApp** | `SITE.contact.whatsapp` | vacío. Formato internacional sin `+` (ej. `51987654321`) |
| **Correo** | `SITE.contact.email` | `elmolinodesabandia@gmail.com`, tomado de la página de Facebook |
| **Instagram / TikTok** | `SITE.contact.instagram`, `.tiktok` | vacíos: no se pintan los enlaces |
| **Hora de cierre** | `SITE.hours.close` | `17:00`; algunas fuentes indican 18:00 |
| **Tarifas de entrada** | `SITE.admission` | S/ 10 general, S/ 5 estudiantes y niños |
| **Coordenadas exactas** | `SITE.geo` | `-16.4548, -71.4909`, aproximadas |
| **Dominio definitivo** | `SITE.url` / `NEXT_PUBLIC_SITE_URL` | `https://molinodesabandia.com` |
| **Señal o anticipo de eventos** | `src/content/legal/terminos.ts` | «[por definir por la administración]» |
| **Política de cancelación y reprogramación** | `src/content/legal/terminos.ts` | «[por definir por la administración]» |
| **Aforo y franjas por tipo de evento** | `EVENT_TYPES` en `src/content/site.ts` | orientativos; la web ya avisa «sujeto a confirmación» |

Para buscarlos todos de golpe:

```bash
grep -rn "TODO confirmar\|por completar\|por definir" src/content/
```

## Cómo cambiar horarios y tarifas

Todo sale de `SITE.hours` y `SITE.admission` en `src/content/site.ts`:

```ts
hours: {
  timezone: "America/Lima",
  days: [0, 1, 2, 3, 4, 5, 6],  // 0 = domingo … 6 = sábado
  open: "09:00",
  close: "17:00",
  note: "Abierto todos los días del año.",
},
admission: [
  { label: "Adultos", price: 10, detail: "Entrada general" },
  // price: null → se muestra "Consultar" en lugar de un importe
],
```

Con eso se actualizan a la vez la píldora «Abre hoy a las 09:00 h» (que compara
con la hora real de Lima, `src/lib/hours.ts`), la sección de horarios de
`/visita`, el footer, el menú y los datos estructurados de Schema.org. **No hay
que tocar ningún componente.** Si cambian los días de apertura, quita los que no
correspondan de `hours.days`.

Las franjas horarias de eventos (`SLOT_LABELS`) y el aforo por tipo de evento
(`EVENT_TYPES`) están en el mismo archivo y los usa el asistente de `/reservas`.

## Cómo reemplazar las fotos provisionales

Las ocho fotografías actuales son de archivo (Wikimedia Commons, dominio público
o CC BY-SA 4.0) y están pensadas para sustituirse por material propio del molino.
Viven en `public/images/` y se declaran en `PHOTOS`, dentro de
`src/content/site.ts`:

| Archivo | Clave en `PHOTOS` | Dónde se usa |
|---|---|---|
| `fachada-jardines.webp` | `fachada` | hero de la portada, OG, galería |
| `panoramica-sabandia.webp` | `panoramica` | franja panorámica de la portada |
| `camino-ingreso.webp` | `camino` | menú overlay, paneles partidos |
| `molino-entre-arboles.webp` | `arboles` | paneles partidos, galería |
| `vista-historica.webp` | `historica` | hero de `/historia` |
| `contrafuertes-1981.webp` | `contrafuertes` | franja duotono «SILLAR VIVO» |
| `escalera-sillar.webp` | `escalera` | paneles partidos, `/historia` |
| `patio-1981.webp` | `patio` | `/eventos`, galería |

Para sustituirlas:

1. Exporta la foto nueva en **WebP**, lado largo de 1920 px (la panorámica puede
   ser más ancha) y calidad ~80.
2. Déjala en `public/images/` con el mismo nombre si quieres el cambio más
   rápido, o con un nombre nuevo y actualiza `src` en `PHOTOS`.
3. Actualiza en esa entrada `width` y `height` **con las medidas reales** (Next
   las usa para reservar el espacio y evitar saltos de maquetación), y también
   `alt`, `caption`, `author`, `year`, `license` y `source`.
4. Si la foto ya es propia, pon `author` con el crédito que corresponda y
   `license: "© Molino de Sabandía"`; el footer y la galería recogen los créditos
   automáticamente desde `PHOTOS`, no hay lista duplicada.
5. Cuando ya no quede ninguna imagen de Wikimedia, borra el párrafo de aviso del
   final de `/galeria` (`src/app/galeria/page.tsx`).

Nota de color: las fotos de archivo tienen temperaturas muy distintas, así que la
galería, los destacados y los heroes aplican la utilidad `.photo-grade`
(`globals.css`) para igualarlas. Con material propio y coherente se puede quitar
esa clase.

La imagen de Open Graph (`public/og.jpg`, 1200×630) también es provisional.

## Cómo ver las reservas

Las solicitudes se consultan en **`/admin/reservas`**, protegido con HTTP Basic:
el navegador pide usuario y contraseña (`ADMIN_USER` / `ADMIN_PASSWORD`). Desde
ahí se puede:

- filtrar por estado y por mes del evento;
- **Confirmar**, **Cancelar** o **Volver a pendiente** cada solicitud (al cambiar
  el estado se avisa al cliente por correo, si Resend está configurado);
- escribir notas internas;
- **Exportar CSV** con el filtro aplicado (se abre en Excel o Google Sheets).

Confirmar una reserva es lo que **bloquea** esa franja en el calendario público;
las pendientes no bloquean, solo se marcan con un punto ocre.

El cliente sigue su solicitud en `/reservas/<código>` (por ejemplo
`/reservas/MS-2026-AB12`), enlace que recibe por correo.

## Accesibilidad y rendimiento

- Móvil primero: probado a 390×844 y 1440×900, sin scroll horizontal en ninguna
  ruta. Botones de 44 px o más, inputs de 16 px (evitan el zoom de iOS).
- Todo el movimiento respeta `prefers-reduced-motion`; el hero tiene además un
  botón para congelar el paneo.
- Formularios con etiquetas asociadas, `aria-invalid`, errores en línea y foco
  visible. Menú overlay con `role="dialog"`, trampa de foco y cierre con Escape.
- Imágenes con `next/image`, `sizes` explícitos y formatos AVIF/WebP.
- Cabeceras de seguridad (`X-Content-Type-Options`, `Referrer-Policy`,
  `X-Frame-Options`, `Permissions-Policy`) en `next.config.ts`.

## Revisión visual

`scripts/shots.mjs` captura una ruta a 1440×900 y 390×844 con Playwright, avisa
de desbordes horizontales y vuelca los errores de consola:

```bash
npm run dev -- -p 3011                       # en otra terminal
node scripts/shots.mjs http://localhost:3011 ./shots / home
node scripts/shots.mjs http://localhost:3011 ./shots /reservas reservas
```

(`./shots` no se versiona: añádelo a tu `.gitignore` local si lo usas mucho.)
