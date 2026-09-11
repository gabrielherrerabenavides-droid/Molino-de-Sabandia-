import { format } from "date-fns";
import { es } from "date-fns/locale";
import { collection, newId, nowIso, publicCode, type Doc } from "@/lib/store";
import { mailLayout, sendMail } from "@/lib/email";
import { SITE } from "@/content/site";
import type { ReclamacionInput } from "@/lib/reclamaciones/schema";

export type Reclamacion = Doc &
  Omit<ReclamacionInput, "honeypot"> & {
    /** Código público de la hoja de reclamación, p. ej. HR-2026-7K3Q. */
    code: string;
    /** Fecha de presentación (ISO), auto-generada por el servidor. */
    fecha: string;
  };

const reclamaciones = collection<Reclamacion>("reclamaciones");

export function formatFecha(iso: string): string {
  return format(new Date(iso), "d 'de' MMMM 'de' yyyy", { locale: es });
}

export async function crearReclamacion(input: ReclamacionInput): Promise<Reclamacion> {
  const { honeypot, ...data } = input;
  void honeypot;
  const now = nowIso();
  const doc: Reclamacion = {
    id: newId(),
    createdAt: now,
    updatedAt: now,
    code: publicCode("HR"),
    fecha: now,
    ...data,
  };
  await reclamaciones.insert(doc);
  await notificarReclamacion(doc);
  return doc;
}

export async function obtenerReclamacionPorCodigo(code: string): Promise<Reclamacion | null> {
  return reclamaciones.findOne((d) => d.code === code.toUpperCase());
}

async function notificarReclamacion(doc: Reclamacion): Promise<void> {
  const fechaLegible = formatFecha(doc.fecha);
  const filas: [string, string][] = [
    ["Hoja de reclamación", doc.code],
    ["Fecha", fechaLegible],
    ["Tipo", doc.tipo],
    ["Nombre completo", doc.nombreCompleto],
    ["Domicilio", doc.domicilio],
    ["Documento", `${doc.tipoDocumento} ${doc.numeroDocumento}`],
    ["Teléfono", doc.telefono],
    ["Correo", doc.email],
    ...(doc.esMenorDeEdad ? [["Padre/madre/tutor", doc.nombreTutor ?? ""] as [string, string]] : []),
    ["Bien contratado", doc.tipoBien],
    ["Descripción del bien", doc.descripcionBien],
    ...(doc.montoReclamado ? [["Monto reclamado", `${SITE.currency} ${doc.montoReclamado}`] as [string, string]] : []),
  ];

  const tablaHtml = filas
    .map(
      ([label, value]) =>
        `<tr><td style="padding:4px 12px 4px 0;color:#63655c;white-space:nowrap;vertical-align:top">${label}</td><td style="padding:4px 0">${escapeHtml(value)}</td></tr>`
    )
    .join("");

  await sendMail({
    to: SITE.contact.email,
    replyTo: doc.email,
    subject: `Nueva hoja de reclamación ${doc.code} — ${doc.tipo}`,
    html: mailLayout(
      `${doc.tipo} ${doc.code}`,
      `<table style="width:100%;border-collapse:collapse;font-size:14px">${tablaHtml}</table>
      <p style="margin-top:20px"><strong>Detalle del ${doc.tipo.toLowerCase()}:</strong><br>${escapeHtml(doc.detalle)}</p>
      <p><strong>Pedido del consumidor:</strong><br>${escapeHtml(doc.pedido)}</p>
      <p style="color:#63655c;font-size:13px">Recuerda responder dentro del plazo legal de 15 días hábiles improrrogables.</p>`
    ),
  });

  await sendMail({
    to: doc.email,
    subject: `Hemos recibido tu hoja de reclamación ${doc.code}`,
    html: mailLayout(
      "Recibimos tu hoja de reclamación",
      `<p>Hola ${escapeHtml(doc.nombreCompleto)}:</p>
      <p>Confirmamos la recepción de tu ${doc.tipo.toLowerCase()} con número de hoja <strong>${doc.code}</strong>, presentado el ${fechaLegible}.</p>
      <p>La formulación del reclamo no impide acudir a otras vías de solución de controversias ni es requisito previo para interponer una denuncia ante el INDECOPI.</p>
      <p>Te responderemos en un plazo no mayor a quince (15) días hábiles, el cual es improrrogable.</p>
      <p>Puedes revisar la constancia de tu hoja en cualquier momento:<br>
      <a href="${SITE.url}/libro-de-reclamaciones/${doc.code}" style="color:#3f6f7a">${SITE.url}/libro-de-reclamaciones/${doc.code}</a></p>`
    ),
  });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
