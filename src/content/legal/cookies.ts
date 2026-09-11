import type { LegalSection } from "@/content/legal/privacidad";

export const COOKIES_ACTUALIZADO = "Septiembre de 2026";

/** Política de cookies y almacenamiento local. */
export const COOKIES_SECTIONS: LegalSection[] = [
  {
    id: "que-son",
    title: "1. Qué son las cookies y el almacenamiento local",
    paragraphs: [
      "Una cookie es un pequeño archivo que un sitio web guarda en tu navegador. El almacenamiento local (\"local storage\") cumple una función parecida: guarda información directamente en tu navegador, sin enviarla a nuestros servidores.",
    ],
  },
  {
    id: "que-usamos",
    title: "2. Qué usamos en este sitio",
    paragraphs: [
      "Este sitio no instala cookies propias ni de analítica o publicidad de terceros. Solo empleamos almacenamiento técnico en tu navegador, imprescindible para que el sitio funcione (por ejemplo, para recordar preferencias de accesibilidad o el estado de un formulario que estás completando).",
      "Como no usamos cookies no esenciales, no mostramos un aviso de consentimiento de cookies: no hay nada que consentir. Sí seguimos pidiendo tu consentimiento, cuando corresponde, para tratar los datos personales que escribes en los formularios; eso se explica en la Política de privacidad.",
      "El único recurso de terceros del sitio es el mapa de Google Maps, que aparece en la página de inicio, en Contacto y en Tu visita. Ese mapa no se carga solo: mostramos un marcador de posición con la dirección y un enlace directo a Google Maps, y el mapa se inserta únicamente si pulsas \"Cargar mapa de Google\". A partir de ese momento Google puede establecer sus propias cookies conforme a su política de privacidad, ajena a nosotros.",
    ],
  },
  {
    id: "como-desactivarlas",
    title: "3. Cómo evitarlas o borrarlas",
    paragraphs: [
      "Si prefieres no cargar el mapa embebido de Google, simplemente no pulses el botón que lo carga: puedes usar el enlace \"Abrir en Google Maps\" que acompaña siempre al marcador de posición, que te lleva al sitio de Google en una pestaña nueva.",
      "Puedes borrar el almacenamiento local y las cookies de tu navegador en cualquier momento desde su configuración de privacidad (por ejemplo, \"Borrar datos de navegación\" en Chrome o Safari). Esto no afecta tu acceso al contenido del sitio.",
    ],
  },
  {
    id: "cambios",
    title: "4. Cambios a esta política",
    paragraphs: [
      "Actualizaremos esta página si cambia la forma en que usamos cookies o almacenamiento local.",
      `Última actualización: ${COOKIES_ACTUALIZADO}.`,
    ],
  },
];
