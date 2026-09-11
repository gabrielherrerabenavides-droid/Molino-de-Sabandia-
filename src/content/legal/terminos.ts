import { SITE } from "@/content/site";
import type { LegalSection } from "@/content/legal/privacidad";

export const TERMINOS_ACTUALIZADO = "Septiembre de 2026";

/**
 * Términos y condiciones de uso del sitio web y de las solicitudes de reserva,
 * conforme al Código de Protección y Defensa del Consumidor (Ley N.º 29571).
 */
export const TERMINOS_SECTIONS: LegalSection[] = [
  {
    id: "objeto",
    title: "1. Objeto y aceptación",
    paragraphs: [
      `Estos términos y condiciones regulan el acceso y uso del sitio web de ${SITE.legalName} (${SITE.url}) y las solicitudes de reserva de visitas, restaurante y eventos que se realizan a través de él.`,
      "Al usar este sitio o enviar cualquiera de sus formularios, aceptas estos términos. Si no estás de acuerdo con ellos, te pedimos no utilizar el sitio.",
    ],
  },
  {
    id: "uso-del-sitio",
    title: "2. Uso del sitio web",
    paragraphs: [
      "El contenido de este sitio es informativo. Nos esforzamos por mantener actualizada la información sobre horarios, tarifas y servicios, pero puede variar sin previo aviso; ante cualquier duda, confirma los datos escribiéndonos directamente.",
      "Te comprometes a usar los formularios del sitio de buena fe y a no introducir contenido falso, ofensivo o que vulnere derechos de terceros.",
    ],
  },
  {
    id: "reservas",
    title: "3. Solicitudes de reserva",
    paragraphs: [
      "El envío de un formulario de reserva (visita en grupo, evento, sesión fotográfica u otro) constituye una solicitud, no una reserva confirmada. La reserva solo se considera confirmada cuando el molino te lo comunica por escrito (correo electrónico, WhatsApp o el canal que corresponda), indicando fecha, horario y condiciones.",
      "Señal o anticipo: condiciones pendientes de publicación. Este sitio no cobra ningún importe. Si tu reserva requiere una señal, te comunicaremos por escrito el importe, el plazo y la forma de pago antes de cualquier cobro, y solo se considerará aceptada cuando la confirmes.",
      "Política de cancelación y reprogramación: condiciones pendientes de publicación. Te informaremos por escrito, junto con la confirmación de tu reserva, las condiciones de cancelación y reprogramación aplicables a tu fecha.",
    ],
  },
  {
    id: "normas-de-visita",
    title: "4. Normas de visita",
    paragraphs: [
      "Pedimos a todos los visitantes respetar el patrimonio histórico del molino: no tocar ni subirse a los mecanismos, muros o elementos de sillar fuera de las zonas habilitadas, y seguir las indicaciones del personal.",
      "Los animales de la campiña (llamas, alpacas, vicuñas, cuyes) deben observarse con cuidado y sin alimentarlos salvo indicación expresa del personal.",
      "La fotografía y el video para uso personal están permitidos. La fotografía o filmación profesional o comercial (sesiones de novios, producciones, contenido publicitario) requiere autorización previa del molino, que puede sujetarse a una tarifa.",
      "No está permitido el ingreso con drones, el consumo de alcohol fuera de las áreas autorizadas, ni cualquier conducta que ponga en riesgo la seguridad de las personas o la conservación del monumento.",
    ],
  },
  {
    id: "propiedad-intelectual",
    title: "5. Propiedad intelectual",
    paragraphs: [
      "Los textos, el diseño y los elementos gráficos propios de este sitio son propiedad del molino o se usan con la debida autorización. Las fotografías históricas y de archivo utilizadas en el sitio mantienen los créditos y licencias indicados en la sección de Galería.",
      "No está permitida la reproducción total o parcial del contenido propio del sitio con fines comerciales sin autorización previa.",
    ],
  },
  {
    id: "responsabilidad",
    title: "6. Limitación de responsabilidad",
    paragraphs: [
      "El molino no será responsable por daños derivados del uso indebido de sus instalaciones, del incumplimiento de las normas de visita, ni por causas de fuerza mayor (condiciones climáticas, caso fortuito, disposiciones de autoridad) que impidan la prestación normal del servicio.",
      "Nada en esta cláusula limita los derechos que la ley peruana reconoce de forma irrenunciable a los consumidores.",
    ],
  },
  {
    id: "proteccion-consumidor",
    title: "7. Protección al consumidor",
    paragraphs: [
      "Como consumidor, tienes los derechos reconocidos por el Código de Protección y Defensa del Consumidor (Ley N.º 29571). Si tienes una disconformidad con el servicio, puedes presentar tu reclamo o queja a través de nuestro Libro de Reclamaciones, disponible en este mismo sitio.",
    ],
  },
  {
    id: "ley-aplicable",
    title: "8. Ley aplicable y jurisdicción",
    paragraphs: [
      "Estos términos se rigen por las leyes de la República del Perú. Para cualquier controversia que no pueda resolverse de forma directa, las partes se someten a la jurisdicción de los juzgados y tribunales de Arequipa, sin perjuicio de los derechos que la normativa de protección al consumidor reconoce ante INDECOPI.",
    ],
  },
  {
    id: "modificaciones",
    title: "9. Modificaciones",
    paragraphs: [
      "Podemos actualizar estos términos cuando sea necesario. La versión vigente es siempre la publicada en esta página.",
      `Última actualización: ${TERMINOS_ACTUALIZADO}.`,
    ],
  },
];
