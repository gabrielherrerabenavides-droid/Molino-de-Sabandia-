/**
 * Correos de reservas: acuse de recibo al cliente, aviso al molino y
 * notificación de cambio de estado. Usa `sendMail`/`mailLayout` de lib/email.
 */
import { SITE } from "@/content/site";
import { mailLayout, sendMail } from "@/lib/email";
import { fechaLarga, franjaLabel } from "@/lib/reservas/format";
import { eventTypeTitle, type Reserva } from "@/lib/reservas/schema";

function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Correo del molino al que se avisan las nuevas solicitudes. */
export function notifyEmail(): string {
  return process.env.RESERVAS_NOTIFY_EMAIL ?? SITE.contact.email;
}

function resumenRows(reserva: Reserva): Array<[string, string]> {
  const rows: Array<[string, string]> = [
    ["Código", reserva.code],
    ["Tipo de evento", eventTypeTitle(reserva.eventType)],
    ["Fecha", fechaLarga(reserva.date)],
    ["Franja", franjaLabel(reserva.slot)],
    ["Personas", String(reserva.guests)],
  ];
  return rows;
}

function tabla(rows: Array<[string, string]>): string {
  const cells = rows
    .map(
      ([k, v]) =>
        `<tr><td style="padding:8px 12px 8px 0;color:#63655c;font-size:13px;letter-spacing:.06em;text-transform:uppercase;white-space:nowrap;vertical-align:top">${esc(k)}</td><td style="padding:8px 0;font-size:16px;vertical-align:top">${esc(v)}</td></tr>`,
    )
    .join("");
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;margin:8px 0 20px">${cells}</table>`;
}

function contactoHtml(): string {
  const lineas = [`Correo: ${SITE.contact.email}`];
  const phone: string = SITE.contact.phone;
  if (phone.length > 0) lineas.push(`Teléfono: ${phone}`);
  const whatsapp: string = SITE.contact.whatsapp;
  if (whatsapp.length > 0) lineas.push(`WhatsApp: +${whatsapp}`);
  lineas.push(SITE.address.full);
  return `<p style="margin:0 0 8px">${lineas.map(esc).join("<br>")}</p>`;
}

/** Acuse de recibo al cliente. */
export async function sendSolicitudCliente(reserva: Reserva) {
  const subject = `Recibimos tu solicitud de reserva · ${reserva.code}`;
  const html = mailLayout(
    "Recibimos tu solicitud",
    `<p style="margin:0 0 16px">Hola ${esc(reserva.name.split(" ")[0] ?? reserva.name)}, gracias por escribirnos. Esta es tu solicitud:</p>
     ${tabla(resumenRows(reserva))}
     <p style="margin:0 0 16px">Guarda tu código <strong>${esc(reserva.code)}</strong>. Puedes consultar el estado en <a href="${SITE.url}/reservas/${esc(reserva.code)}" style="color:#8a6a34">${SITE.url}/reservas/${esc(reserva.code)}</a>.</p>
     <p style="margin:0 0 16px"><strong>Te confirmamos en 24–48 h</strong> la disponibilidad de la fecha y las condiciones. Todavía no es una reserva confirmada.</p>
     <p style="margin:0 0 8px;font-size:13px;letter-spacing:.06em;text-transform:uppercase;color:#63655c">Cualquier duda</p>
     ${contactoHtml()}`,
  );
  const text = [
    `Recibimos tu solicitud de reserva (${reserva.code}).`,
    ...resumenRows(reserva).map(([k, v]) => `${k}: ${v}`),
    "",
    "Te confirmamos en 24-48 h la disponibilidad y las condiciones.",
    `Estado de tu solicitud: ${SITE.url}/reservas/${reserva.code}`,
    `Contacto: ${SITE.contact.email}`,
  ].join("\n");
  return sendMail({ to: reserva.email, subject, html, text, replyTo: notifyEmail() });
}

/** Aviso interno al molino. */
export async function sendSolicitudAdmin(reserva: Reserva) {
  const subject = `Nueva solicitud de reserva: ${eventTypeTitle(reserva.eventType)} · ${reserva.date}`;
  const rows: Array<[string, string]> = [
    ...resumenRows(reserva),
    ["Nombre", reserva.name],
    ["Correo", reserva.email],
    ["Teléfono", reserva.phone],
    ["Mensaje", reserva.message ?? "—"],
    ["Estado", reserva.status],
    ["Origen", reserva.source],
    ["IP", reserva.ip ?? "—"],
    ["Navegador", reserva.userAgent ?? "—"],
    ["Recibida", reserva.createdAt],
  ];
  const html = mailLayout(
    "Nueva solicitud de reserva",
    `${tabla(rows)}
     <p style="margin:0"><a href="${SITE.url}/admin/reservas" style="color:#8a6a34">Gestionar en /admin/reservas</a></p>`,
  );
  const text = [
    "Nueva solicitud de reserva",
    ...rows.map(([k, v]) => `${k}: ${v}`),
    "",
    `${SITE.url}/admin/reservas`,
  ].join("\n");
  return sendMail({ to: notifyEmail(), subject, html, text, replyTo: reserva.email });
}

const ESTADO_COPY: Record<Reserva["status"], { subject: (code: string) => string; title: string; body: string }> = {
  confirmada: {
    subject: (code) => `Tu reserva está confirmada · ${code}`,
    title: "Tu reserva está confirmada",
    body: "Reservamos la fecha para ti. Si necesitas cambiar algo, escríbenos respondiendo a este correo.",
  },
  cancelada: {
    subject: (code) => `Tu solicitud de reserva fue cancelada · ${code}`,
    title: "Tu solicitud fue cancelada",
    body: "Lo sentimos: no podemos atender esta solicitud. Si quieres proponer otra fecha, respóndenos a este correo y lo vemos.",
  },
  pendiente: {
    subject: (code) => `Tu solicitud de reserva vuelve a revisión · ${code}`,
    title: "Tu solicitud vuelve a revisión",
    body: "Estamos revisando de nuevo la disponibilidad de tu fecha. Te escribimos en cuanto la tengamos clara.",
  },
};

/** Aviso al cliente cuando la administración cambia el estado. */
export async function sendEstadoCliente(reserva: Reserva) {
  const copy = ESTADO_COPY[reserva.status];
  const notas = reserva.adminNotes?.trim();
  const html = mailLayout(
    copy.title,
    `<p style="margin:0 0 16px">Hola ${esc(reserva.name.split(" ")[0] ?? reserva.name)}:</p>
     ${tabla(resumenRows(reserva))}
     <p style="margin:0 0 16px">${esc(copy.body)}</p>
     ${notas ? `<p style="margin:0 0 16px;padding:12px 14px;background:#efece3">${esc(notas)}</p>` : ""}
     <p style="margin:0 0 8px;font-size:13px;letter-spacing:.06em;text-transform:uppercase;color:#63655c">Contacto</p>
     ${contactoHtml()}`,
  );
  const text = [
    copy.title,
    ...resumenRows(reserva).map(([k, v]) => `${k}: ${v}`),
    "",
    copy.body,
    ...(notas ? ["", notas] : []),
    `Contacto: ${SITE.contact.email}`,
  ].join("\n");
  return sendMail({ to: reserva.email, subject: copy.subject(reserva.code), html, text, replyTo: notifyEmail() });
}
