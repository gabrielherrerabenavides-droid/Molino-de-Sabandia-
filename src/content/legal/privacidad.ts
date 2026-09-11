import { SITE } from "@/content/site";

export type LegalSection = { id: string; title: string; paragraphs: string[] };

/**
 * Política de privacidad conforme a la Ley N.º 29733, Ley de Protección de Datos
 * Personales, y su reglamento (D.S. N.º 016-2024-JUS). Texto estructurado en
 * secciones para renderizar con `Prose` y un índice lateral en `/legal/layout.tsx`.
 */
export const PRIVACIDAD_ACTUALIZADO = "Septiembre de 2026";

const RUC = SITE.ruc ? `RUC ${SITE.ruc}` : "RUC pendiente de confirmación";

export const PRIVACIDAD_SECTIONS: LegalSection[] = [
  {
    id: "responsable",
    title: "1. Responsable del tratamiento",
    paragraphs: [
      `${SITE.legalName}, con ${RUC} y domicilio en ${SITE.address.full}, es responsable del tratamiento de los datos personales que recoge a través de este sitio web (en adelante, "el molino" o "nosotros").`,
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
      "Tratamos tus datos con bases legales distintas según la finalidad: (a) tu consentimiento libre, previo, expreso, inequívoco e informado, que otorgas al marcar la casilla del formulario de contacto, para responder tu consulta y para enviarte información sobre el molino; (b) la ejecución de la relación contractual o de las medidas precontractuales que solicitas, para gestionar y confirmar tus solicitudes de reserva de visitas y eventos; (c) el cumplimiento de una obligación legal, para recibir, tramitar y conservar las hojas del Libro de Reclamaciones, conforme al Código de Protección y Defensa del Consumidor (Ley N.º 29571) y a su Reglamento del Libro de Reclamaciones (D.S. N.º 011-2011-PCM), supuesto exceptuado del consentimiento por el artículo 14 de la Ley N.º 29733; y (d) nuestro interés legítimo en la seguridad del servicio, para registrar la dirección IP y los datos técnicos del envío de formularios y prevenir abusos y envíos automatizados.",
      "Puedes retirar tu consentimiento en cualquier momento escribiendo a nuestro correo de contacto, sin que ello afecte la licitud del tratamiento realizado con anterioridad. El retiro detiene los tratamientos que se apoyan en el consentimiento, pero no alcanza a los datos que debemos conservar por mandato legal —en particular, las hojas del Libro de Reclamaciones, que conservamos por un plazo no menor a dos (2) años desde su presentación— ni a los registros técnicos mínimos necesarios para la seguridad del sitio.",
    ],
  },
  {
    id: "datos",
    title: "4. Datos que recogemos",
    paragraphs: [
      "Recogemos los datos que tú mismo nos proporcionas en los formularios de contacto, reservas y libro de reclamaciones: nombre, correo electrónico, teléfono, domicilio, tipo y número de documento de identidad cuando corresponde, y el contenido de tu mensaje o reclamación.",
      "También registramos automáticamente datos técnicos de navegación (registros o \"logs\" del servidor, como dirección IP y fecha/hora de la solicitud) con fines de seguridad y prevención de abuso de los formularios. No usamos cookies de analítica ni de publicidad (ver nuestra Política de cookies).",
    ],
  },
  {
    id: "conservacion",
    title: "5. Plazo de conservación",
    paragraphs: [
      "Conservamos tus datos durante plazos determinados según la finalidad: las hojas del Libro de Reclamaciones, por un plazo no menor a dos (2) años desde su presentación, por mandato del D.S. N.º 011-2011-PCM; las solicitudes de reserva, hasta dos (2) años después de la fecha del evento o de la última gestión relacionada con ella; las consultas de contacto, hasta doce (12) meses desde nuestra respuesta; y los datos técnicos asociados a un envío (dirección IP y navegador), noventa (90) días, solo con fines de seguridad.",
      "Cuando ya no sean necesarios para su finalidad y no exista obligación legal de conservarlos, dejaremos de usarlos y los eliminaremos o anonimizaremos de forma segura.",
    ],
  },
  {
    id: "encargados",
    title: "6. Encargados del tratamiento y flujo transfronterizo",
    paragraphs: [
      "Para operar este sitio utilizamos encargados de tratamiento ubicados fuera del Perú: Vercel Inc. (alojamiento del sitio y registros de servidor, Estados Unidos de América), Neon Inc. (base de datos de reservas y reclamaciones, Estados Unidos de América) y Resend (envío de correo transaccional, Estados Unidos de América). Esto implica un flujo transfronterizo de tus datos personales, del que te informamos en el momento de la recogida.",
      "Este flujo se ampara en los acuerdos de tratamiento de datos suscritos con cada proveedor, que incorporan cláusulas contractuales de confidencialidad y seguridad exigibles conforme a los artículos 15 y 18 de la Ley N.º 29733 y a su reglamento (D.S. N.º 016-2024-JUS). Solo les encargamos el tratamiento estrictamente necesario para prestar el servicio contratado. No vendemos ni compartimos tus datos con terceros para fines distintos a los descritos en esta política.",
    ],
  },
  {
    id: "derechos-arco",
    title: "7. Tus derechos ARCO",
    paragraphs: [
      "Como titular de tus datos personales, tienes derecho a acceder a ellos, rectificarlos si son inexactos, cancelarlos cuando ya no sean necesarios o hayas retirado tu consentimiento —salvo los datos que debamos conservar por mandato legal mientras dure el plazo aplicable— y oponerte a su tratamiento (derechos ARCO), así como a solicitar información sobre a quién se han transferido.",
      `Para ejercer estos derechos, escríbenos a ${SITE.contact.email} indicando tu nombre completo, el derecho que deseas ejercer y una copia de tu documento de identidad. Conforme a la Ley N.º 29733 y su reglamento, atenderemos las solicitudes de acceso en un plazo máximo de veinte (20) días hábiles y las de rectificación, cancelación y oposición en un plazo máximo de diez (10) días hábiles, contados desde el día siguiente de la recepción de la solicitud o de su subsanación. Estos plazos pueden ampliarse una sola vez, por un periodo igual como máximo, cuando las circunstancias lo justifiquen; en ese caso te lo comunicaremos antes de su vencimiento.`,
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
