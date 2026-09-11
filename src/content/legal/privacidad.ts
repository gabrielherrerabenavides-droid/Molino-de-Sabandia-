import { SITE } from "@/content/site";

export type LegalSection = { id: string; title: string; paragraphs: string[] };

/**
 * Política de privacidad conforme a la Ley N.º 29733, Ley de Protección de Datos
 * Personales, y su reglamento (D.S. N.º 016-2024-JUS). Texto estructurado en
 * secciones para renderizar con `Prose` y un índice lateral en `/legal/layout.tsx`.
 */
export const PRIVACIDAD_ACTUALIZADO = "Septiembre de 2026";

export const PRIVACIDAD_SECTIONS: LegalSection[] = [
  {
    id: "responsable",
    title: "1. Responsable del tratamiento",
    paragraphs: [
      `${SITE.legalName}, con RUC [por completar] y domicilio en ${SITE.address.full}, es responsable del tratamiento de los datos personales que recoge a través de este sitio web (en adelante, "el molino" o "nosotros").`,
      `Puedes contactarnos para cualquier consulta sobre esta política escribiendo a ${SITE.contact.email}.`,
    ],
  },
  {
    id: "finalidades",
    title: "2. Finalidades del tratamiento",
    paragraphs: [
      "Usamos los datos personales que nos proporcionas a través de los formularios del sitio para: gestionar solicitudes de reserva de visitas y eventos, responder consultas de contacto, tramitar reclamaciones y quejas conforme al Libro de Reclamaciones, y, únicamente si lo consientes de forma expresa, enviarte información sobre el molino.",
      "No usamos tus datos para finalidades distintas a las indicadas ni los cedemos a terceros con fines comerciales o publicitarios.",
    ],
  },
  {
    id: "base-legal",
    title: "3. Base legal",
    paragraphs: [
      "La base legal para el tratamiento de tus datos es tu consentimiento libre, previo, expreso, inequívoco e informado, que otorgas al marcar la casilla de consentimiento en cada formulario antes de enviarlo.",
      "Puedes retirar tu consentimiento en cualquier momento, sin que ello afecte la licitud del tratamiento realizado con anterioridad, escribiendo a nuestro correo de contacto.",
    ],
  },
  {
    id: "datos",
    title: "4. Datos que recogemos",
    paragraphs: [
      "Recogemos los datos que tú mismo nos proporcionas en los formularios de contacto, reservas y libro de reclamaciones: nombre, correo electrónico, teléfono, domicilio, tipo y número de documento de identidad cuando corresponde, y el contenido de tu mensaje o reclamación.",
      "También registramos automáticamente datos técnicos de navegación (registros o \"logs\" del servidor, como dirección IP y fecha/hora de la solicitud) con fines de seguridad y prevención de abuso de los formularios, y la preferencia de cookies que guardas en tu propio navegador (ver nuestra Política de cookies).",
    ],
  },
  {
    id: "conservacion",
    title: "5. Plazo de conservación",
    paragraphs: [
      "Conservamos tus datos únicamente durante el tiempo necesario para cumplir la finalidad para la que fueron recogidos y, después, durante los plazos legales de conservación que correspondan (por ejemplo, los reclamos registrados en el Libro de Reclamaciones se conservan conforme a la normativa de protección al consumidor). Transcurridos esos plazos, los datos se eliminan o anonimizan de forma segura.",
    ],
  },
  {
    id: "encargados",
    title: "6. Encargados del tratamiento y transferencia de datos",
    paragraphs: [
      "Para operar este sitio y responder tus solicitudes utilizamos proveedores de infraestructura tecnológica —alojamiento (Vercel), envío de correo electrónico (Resend) y base de datos (Neon)— que pueden estar ubicados fuera del territorio peruano.",
      "Cuando esto ocurre, exigimos a estos proveedores garantías contractuales de confidencialidad y seguridad equivalentes a las que exige la Ley N.º 29733, y solo les encargamos el tratamiento estrictamente necesario para prestar el servicio contratado. No vendemos ni compartimos tus datos con terceros para fines distintos a los descritos en esta política.",
    ],
  },
  {
    id: "derechos-arco",
    title: "7. Tus derechos ARCO",
    paragraphs: [
      "Como titular de tus datos personales, tienes derecho a acceder a ellos, rectificarlos si son inexactos, cancelarlos cuando ya no sean necesarios o hayas retirado tu consentimiento, y oponerte a su tratamiento (derechos ARCO), así como a solicitar información sobre a quién se han transferido.",
      `Para ejercer estos derechos, escríbenos a ${SITE.contact.email} indicando tu nombre completo, el derecho que deseas ejercer y una copia de tu documento de identidad. Responderemos tu solicitud dentro del plazo legal establecido por el reglamento de la Ley N.º 29733 (hasta 20 días hábiles, prorrogables por causa justificada).`,
    ],
  },
  {
    id: "reclamo-autoridad",
    title: "8. Reclamo ante la autoridad de protección de datos",
    paragraphs: [
      "Si consideras que no hemos atendido correctamente tu solicitud o que hemos vulnerado tus derechos, puedes presentar un reclamo ante la Autoridad Nacional de Protección de Datos Personales, dependiente del Ministerio de Justicia y Derechos Humanos del Perú.",
    ],
  },
  {
    id: "menores",
    title: "9. Menores de edad",
    paragraphs: [
      "Nuestros formularios están dirigidos a personas mayores de edad. Si un menor de edad necesita presentar una queja o reclamo, el formulario del Libro de Reclamaciones permite indicar el nombre del padre, madre o tutor responsable.",
    ],
  },
  {
    id: "seguridad",
    title: "10. Seguridad de la información",
    paragraphs: [
      "Aplicamos medidas técnicas y organizativas razonables (conexión cifrada, límites de envío por formulario y acceso restringido a la información) para proteger tus datos personales frente a pérdida, uso indebido o acceso no autorizado.",
    ],
  },
  {
    id: "cambios",
    title: "11. Cambios a esta política",
    paragraphs: [
      `Podemos actualizar esta política para reflejar cambios legales u operativos. Publicaremos siempre la versión vigente en esta página, indicando la fecha de última actualización.`,
      `Última actualización: ${PRIVACIDAD_ACTUALIZADO}.`,
    ],
  },
];
