/**
 * Libro de Reclamaciones (D.S. N.º 011-2011-PCM, D.S. N.º 006-2014-PCM y D.S. N.º 101-2022-PCM).
 *
 * Cada hoja lleva:
 *  - `numero`: correlativo atómico (`nextSequence`), nunca reutilizado ni salteado.
 *  - `code`: número de hoja legible, HR-<año Lima>-<correlativo a 6 dígitos>.
 *  - `token`: 130 bits opacos, única llave de la URL de la constancia.
 * Las hojas deben conservarse por un plazo no menor a dos (2) años, así que el
 * registro electrónico solo se acepta con almacenamiento duradero: Postgres o una
 * carpeta persistente declarada en `MOLINO_DATA_DIR`.
 */
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { accessToken, collection, limaYear, newId, nextSequence, nowIso, storageDurable, type Doc } from "@/lib/store";
import { mailLayout, sendMail } from "@/lib/email";
import { SITE } from "@/content/site";
import { PLAZO_RESPUESTA, type EstadoReclamacion } from "@/lib/reclamaciones/constants";
import type { ReclamacionFiltro, ReclamacionInput } from "@/lib/reclamaciones/schema";

export type Reclamacion = Doc &
  Omit<ReclamacionInput, "honeypot"> & {
    /** Número de hoja legible, p. ej. HR-2026-000012. */
    code: string;
    /** Correlativo puro, para auditoría ante INDECOPI. */
    numero: number;
    /** Llave opaca de la URL de la constancia. */
    token: string;
    /** Fecha de presentación (ISO), generada por el servidor. */
    fecha: string;
    estado: EstadoReclamacion;
    /** Observaciones y acciones adoptadas por el proveedor (sección 4 de la hoja). */
    respuesta?: string;
    /** Fecha de comunicación de la respuesta al consumidor (ISO). */
    respondidaEn?: string;
    /** Si la copia al consumidor salió de verdad (Resend configurado y sin error). */
    emailEnviado: boolean;
  };

const reclamaciones = collection<Reclamacion>("reclamaciones");

/**
 * El registro electrónico exige persistencia duradera: las hojas se conservan dos
 * años. Vale Postgres o un volumen declarado con `MOLINO_DATA_DIR`; en producción
 * sobre `/tmp` no se acepta, porque se perdería en el siguiente despliegue.
 */
export function registroDisponible(): boolean {
  return storageDurable;
}

export const REGISTRO_NO_DISPONIBLE = `El registro electrónico no está disponible temporalmente. Escríbenos a ${SITE.contact.email} o presenta tu reclamo en el establecimiento.`;

export function formatFecha(iso: string): string {
  return format(new Date(iso), "d 'de' MMMM 'de' yyyy", { locale: es });
}

/** "DNI ****1234": el documento nunca se muestra completo en una página pública. */
export function enmascararDocumento(tipo: string, numero: string): string {
  const limpio = numero.trim();
  const visibles = limpio.slice(-4);
  return `${tipo} ${"*".repeat(Math.max(limpio.length - visibles.length, 0))}${visibles}`;
}

/** "a***@dominio.com" */
export function enmascararEmail(email: string): string {
  const [usuario, dominio] = email.split("@");
  if (!dominio) return "***";
  const inicial = usuario.slice(0, 1);
  return `${inicial}${"*".repeat(Math.max(usuario.length - 1, 1))}@${dominio}`;
}

/** "987***321": teléfono parcial para la constancia. */
export function enmascararTelefono(telefono: string): string {
  const limpio = telefono.trim();
  if (limpio.length <= 4) return "*".repeat(limpio.length);
  return `${limpio.slice(0, 3)}${"*".repeat(Math.max(limpio.length - 6, 1))}${limpio.slice(-3)}`;
}

export async function crearReclamacion(input: ReclamacionInput): Promise<Reclamacion> {
  if (!registroDisponible()) throw new Error("Libro de Reclamaciones sin almacenamiento duradero");

  const { honeypot, ...data } = input;
  void honeypot;
  const now = nowIso();
  const numero = await nextSequence("hoja_reclamacion");
  const doc: Reclamacion = {
    id: newId(),
    createdAt: now,
    updatedAt: now,
    numero,
    code: `HR-${limaYear()}-${String(numero).padStart(6, "0")}`,
    token: accessToken(),
    fecha: now,
    estado: "pendiente",
    emailEnviado: false,
    ...data,
  };
  await reclamaciones.insert(doc);

  const emailEnviado = await notificarReclamacion(doc);
  if (emailEnviado) {
    await reclamaciones.update(doc.id, { emailEnviado });
    return { ...doc, emailEnviado };
  }
  return doc;
}

export async function obtenerReclamacionPorToken(token: string): Promise<Reclamacion | null> {
  return reclamaciones.findBy("token", token);
}

export async function listarReclamaciones(filtro: ReclamacionFiltro = {}): Promise<Reclamacion[]> {
  const list = await reclamaciones.list((d) => (filtro.estado ? d.estado === filtro.estado : true));
  return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function contarReclamacionesPorEstado(): Promise<Record<EstadoReclamacion, number>> {
  const list = await reclamaciones.list();
  return {
    pendiente: list.filter((d) => d.estado === "pendiente").length,
    respondida: list.filter((d) => d.estado === "respondida").length,
  };
}

export type ResponderResultado =
  | { ok: true; reclamacion: Reclamacion }
  | { ok: false; status: number; error: string };

/** Registra la respuesta del proveedor y la comunica al consumidor por correo. */
export async function responderReclamacion(
  id: string,
  patch: { respuesta: string; estado?: EstadoReclamacion }
): Promise<ResponderResultado> {
  const actual = await reclamaciones.get(id);
  if (!actual) return { ok: false, status: 404, error: "No encontramos esa hoja de reclamación." };

  const estado: EstadoReclamacion = patch.estado ?? "respondida";
  const respondidaEn = estado === "respondida" ? nowIso() : undefined;
  const actualizada = await reclamaciones.update(id, {
    respuesta: patch.respuesta,
    estado,
    ...(respondidaEn ? { respondidaEn } : {}),
  });
  if (!actualizada) return { ok: false, status: 404, error: "No encontramos esa hoja de reclamación." };

  if (estado === "respondida") await notificarRespuesta(actualizada);
  return { ok: true, reclamacion: actualizada };
}

/* ------------------------------- Correos -------------------------------- */

function filasDeHoja(doc: Reclamacion): [string, string][] {
  return [
    ["Hoja de reclamación", doc.code],
    ["Fecha", formatFecha(doc.fecha)],
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
}

function tablaHtml(filas: [string, string][]): string {
  const cuerpo = filas
    .map(
      ([label, value]) =>
        `<tr><td style="padding:4px 12px 4px 0;color:#63655c;white-space:nowrap;vertical-align:top">${escapeHtml(label)}</td><td style="padding:4px 0">${escapeHtml(value)}</td></tr>`
    )
    .join("");
  return `<table style="width:100%;border-collapse:collapse;font-size:14px">${cuerpo}</table>`;
}

/**
 * Aviso al molino y copia íntegra de la hoja al consumidor (obligación del
 * D.S. N.º 006-2014-PCM). Devuelve si la copia al consumidor se envió de verdad.
 */
async function notificarReclamacion(doc: Reclamacion): Promise<boolean> {
  const filas = filasDeHoja(doc);
  const detalleHtml = `<p style="margin-top:20px"><strong>Detalle del ${escapeHtml(doc.tipo.toLowerCase())}:</strong><br>${escapeHtml(doc.detalle)}</p>
      <p><strong>Pedido del consumidor:</strong><br>${escapeHtml(doc.pedido)}</p>`;

  await sendMail({
    to: SITE.contact.email,
    replyTo: doc.email,
    subject: `Nueva hoja de reclamación ${doc.code} — ${doc.tipo}`,
    html: mailLayout(
      `${doc.tipo} ${doc.code}`,
      `${tablaHtml(filas)}${detalleHtml}
      <p style="color:#63655c;font-size:13px">Recuerda responder dentro del plazo legal de ${PLAZO_RESPUESTA} improrrogables.</p>`
    ),
  });

  // Copia de la hoja al consumidor: es su constancia, así que va completa.
  const copia = await sendMail({
    to: doc.email,
    subject: `Copia de tu hoja de reclamación ${doc.code}`,
    html: mailLayout(
      "Recibimos tu hoja de reclamación",
      `<p>Hola ${escapeHtml(doc.nombreCompleto)}:</p>
      <p>Esta es la copia de tu ${escapeHtml(doc.tipo.toLowerCase())} con número de hoja <strong>${escapeHtml(doc.code)}</strong>, presentado el ${escapeHtml(formatFecha(doc.fecha))}.</p>
      ${tablaHtml(filas)}${detalleHtml}
      <p>La formulación del reclamo no impide acudir a otras vías de solución de controversias ni es requisito previo para interponer una denuncia ante el INDECOPI.</p>
      <p>Te responderemos en un plazo no mayor a ${PLAZO_RESPUESTA}, el cual es improrrogable.</p>
      <p>Guarda este enlace: es tu constancia.<br>
      <a href="${SITE.url}/libro-de-reclamaciones/${doc.token}" style="color:#3f6f7a">${SITE.url}/libro-de-reclamaciones/${doc.token}</a></p>`
    ),
  });

  return copia.ok === true && copia.skipped !== true;
}

async function notificarRespuesta(doc: Reclamacion): Promise<void> {
  await sendMail({
    to: doc.email,
    replyTo: SITE.contact.email,
    subject: `Respuesta a tu hoja de reclamación ${doc.code}`,
    html: mailLayout(
      "Respuesta a tu hoja de reclamación",
      `<p>Hola ${escapeHtml(doc.nombreCompleto)}:</p>
      <p>Estas son las observaciones y acciones adoptadas por ${escapeHtml(SITE.legalName)} respecto de tu ${escapeHtml(doc.tipo.toLowerCase())} <strong>${escapeHtml(doc.code)}</strong>, presentado el ${escapeHtml(formatFecha(doc.fecha))}.</p>
      <p>${escapeHtml(doc.respuesta ?? "").replace(/\n/g, "<br>")}</p>
      <p>Puedes consultar tu constancia actualizada aquí:<br>
      <a href="${SITE.url}/libro-de-reclamaciones/${doc.token}" style="color:#3f6f7a">${SITE.url}/libro-de-reclamaciones/${doc.token}</a></p>
      <p style="color:#63655c;font-size:13px">Esta respuesta no limita tu derecho a acudir a otras vías de solución de controversias ni a denunciar ante el INDECOPI.</p>`
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

/* ---------------------------------- CSV ---------------------------------- */

const CSV_HEADERS = [
  "numero",
  "codigo",
  "estado",
  "fecha",
  "tipo",
  "nombre",
  "documento",
  "telefono",
  "email",
  "domicilio",
  "bien",
  "descripcion_bien",
  "monto",
  "detalle",
  "pedido",
  "respuesta",
  "respondida_en",
  "copia_email",
] as const;

/** Escapa la celda y neutraliza fórmulas (=, +, -, @) para que Excel no las ejecute. */
function csvCell(value: string | number | undefined): string {
  const text = value === undefined ? "" : String(value);
  const seguro = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
  return `"${seguro.replace(/"/g, '""').replace(/\r?\n/g, " ")}"`;
}

/** CSV (RFC 4180) con BOM para que Excel respete los acentos. */
export function reclamacionesToCsv(list: readonly Reclamacion[]): string {
  const rows = list.map((r) =>
    [
      r.numero,
      r.code,
      r.estado,
      r.fecha,
      r.tipo,
      r.nombreCompleto,
      `${r.tipoDocumento} ${r.numeroDocumento}`,
      r.telefono,
      r.email,
      r.domicilio,
      r.tipoBien,
      r.descripcionBien,
      r.montoReclamado,
      r.detalle,
      r.pedido,
      r.respuesta,
      r.respondidaEn,
      r.emailEnviado ? "enviada" : "no enviada",
    ]
      .map(csvCell)
      .join(",")
  );
  return `\uFEFF${CSV_HEADERS.join(",")}\r\n${rows.join("\r\n")}${rows.length > 0 ? "\r\n" : ""}`;
}
