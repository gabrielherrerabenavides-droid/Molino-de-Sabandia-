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
      "Este sitio no usa cookies de analítica ni de publicidad de terceros. Solo guardamos, en el almacenamiento local de tu navegador (no en una cookie de servidor), tu preferencia de consentimiento bajo la clave técnica \"msb-cookies\", para recordar si ya aceptaste o rechazaste el uso de datos personales en los formularios.",
      "Si en el futuro incorporamos un mapa de Google Maps embebido en alguna página (como en Tu visita), ten en cuenta que Google puede establecer sus propias cookies técnicas o de preferencia al cargar ese mapa, conforme a su propia política de privacidad, ajena a nosotros.",
    ],
  },
  {
    id: "como-desactivarlas",
    title: "3. Cómo desactivarlas",
    paragraphs: [
      "Puedes borrar el almacenamiento local de tu navegador en cualquier momento desde su configuración de privacidad (por ejemplo, \"Borrar datos de navegación\" en Chrome o Safari). Esto no afecta tu acceso al contenido del sitio, aunque puede que tengamos que pedirte de nuevo tu consentimiento en los formularios.",
      "Si prefieres no cargar el mapa embebido de Google en la página Tu visita, puedes usar directamente el enlace a Google Maps que ofrecemos junto al mapa.",
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
