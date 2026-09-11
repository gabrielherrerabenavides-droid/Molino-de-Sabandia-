/**
 * Casos de uso de reservas: crear una solicitud, consultarla, listarla para
 * administración y cambiar su estado. Solo servidor.
 */
import { collection, newId, nowIso, publicCode, type Collection } from "@/lib/store";
import {
  buildMonthAvailability,
  isSlotAvailable,
  monthOf,
  todayInTimeZone,
  type MesDisponibilidad,
  type Ocupacion,
} from "@/lib/reservas/availability";
import { sendEstadoCliente, sendSolicitudAdmin, sendSolicitudCliente } from "@/lib/reservas/mail";
import {
  eventTypeTitle,
  fieldErrors,
  reservaInputSchema,
  slotLabel,
  type Reserva,
  type ReservaFiltro,
  type ReservaPatch,
  type ReservaStatus,
} from "@/lib/reservas/schema";

let cache: Collection<Reserva> | null = null;
function store(): Collection<Reserva> {
  return (cache ??= collection<Reserva>("reservas"));
}

export type RequestMeta = { ip?: string; userAgent?: string };

/** Extrae IP y navegador de la petición para guardarlos con la solicitud. */
export function requestMeta(req: Request): RequestMeta {
  const forwarded = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwarded || req.headers.get("x-real-ip") || undefined;
  const userAgent = req.headers.get("user-agent")?.slice(0, 300) || undefined;
  return { ip, userAgent };
}

function toOcupacion(list: readonly Reserva[]): Ocupacion[] {
  return list.map((r) => ({ date: r.date, slot: r.slot, status: r.status }));
}

function porFechaDesc(a: Reserva, b: Reserva): number {
  return b.createdAt.localeCompare(a.createdAt);
}

/* ----------------------------- disponibilidad ---------------------------- */

/** Mes actual en hora de Lima, en formato YYYY-MM. */
export function mesActual(now: Date = new Date()): string {
  return monthOf(todayInTimeZone(now));
}

export async function disponibilidadDelMes(mes: string, now: Date = new Date()): Promise<MesDisponibilidad> {
  const delMes = await store().list((r) => monthOf(r.date) === mes);
  return buildMonthAvailability(mes, toOcupacion(delMes), now);
}

/* -------------------------------- consultas ------------------------------ */

export async function reservaPorCodigo(code: string): Promise<Reserva | null> {
  const normalizado = code.trim().toUpperCase();
  if (normalizado.length === 0 || normalizado.length > 40) return null;
  return store().findOne((r) => r.code === normalizado);
}

export async function reservaPorId(id: string): Promise<Reserva | null> {
  return store().get(id);
}

export async function listarReservas(filtro: ReservaFiltro = {}): Promise<Reserva[]> {
  const list = await store().list((r) => {
    if (filtro.status && r.status !== filtro.status) return false;
    if (filtro.mes && monthOf(r.date) !== filtro.mes) return false;
    return true;
  });
  return [...list].sort(porFechaDesc);
}

/** Meses con al menos una reserva, de más reciente a más antiguo. */
export async function mesesConReservas(): Promise<string[]> {
  const list = await store().list();
  return [...new Set(list.map((r) => monthOf(r.date)))].sort((a, b) => b.localeCompare(a));
}

export async function contarPorEstado(): Promise<Record<ReservaStatus, number>> {
  const list = await store().list();
  const out: Record<ReservaStatus, number> = { pendiente: 0, confirmada: 0, cancelada: 0 };
  for (const r of list) out[r.status] += 1;
  return out;
}

/* --------------------------------- crear --------------------------------- */

export type CrearResultado =
  | { ok: true; reserva: Reserva }
  | { ok: false; status: 422 | 409 | 500; error: string; fields?: Record<string, string> };

/** Valida, comprueba disponibilidad, guarda y avisa por correo. */
export async function crearReserva(raw: unknown, meta: RequestMeta = {}): Promise<CrearResultado> {
  const parsed = reservaInputSchema.safeParse(raw);
  if (!parsed.success) {
    const fields = fieldErrors(parsed.error);
    return {
      ok: false,
      status: 422,
      error: "Revisa los datos marcados del formulario.",
      fields,
    };
  }
  const input = parsed.data;
  if (input.website && input.website.length > 0) {
    return { ok: false, status: 422, error: "No pudimos procesar la solicitud." };
  }

  const delDia = await store().list((r) => r.date === input.date);
  if (!isSlotAvailable(input.date, input.slot, toOcupacion(delDia))) {
    return {
      ok: false,
      status: 409,
      error: `Acabamos de confirmar otro evento el ${input.date} en la franja "${slotLabel(input.slot)}". Elige otra fecha u otra franja.`,
      fields: { date: "Esa fecha ya no está disponible en esa franja." },
    };
  }

  const ahora = nowIso();
  const reserva: Reserva = {
    id: newId(),
    createdAt: ahora,
    updatedAt: ahora,
    code: publicCode("MS"),
    eventType: input.eventType,
    date: input.date,
    slot: input.slot,
    guests: input.guests,
    name: input.name,
    email: input.email,
    phone: input.phone,
    ...(input.message ? { message: input.message } : {}),
    consent: true,
    status: "pendiente",
    source: "web",
    ...(meta.ip ? { ip: meta.ip } : {}),
    ...(meta.userAgent ? { userAgent: meta.userAgent } : {}),
  };

  try {
    await store().insert(reserva);
  } catch {
    return { ok: false, status: 500, error: "No pudimos guardar tu solicitud. Inténtalo de nuevo en unos minutos." };
  }

  // Los correos nunca deben tumbar la solicitud ya guardada.
  await Promise.allSettled([sendSolicitudCliente(reserva), sendSolicitudAdmin(reserva)]);

  return { ok: true, reserva };
}

/* ----------------------------- cambio de estado -------------------------- */

export type ActualizarResultado =
  | { ok: true; reserva: Reserva }
  | { ok: false; status: 404 | 500; error: string };

/** Cambia el estado (y las notas) y avisa al cliente si el estado cambió. */
export async function actualizarEstado(id: string, patch: ReservaPatch): Promise<ActualizarResultado> {
  const actual = await store().get(id);
  if (!actual) return { ok: false, status: 404, error: "No encontramos esa reserva." };

  const cambiaEstado = actual.status !== patch.status;
  const actualizada = await store().update(id, {
    status: patch.status,
    adminNotes: patch.adminNotes ?? actual.adminNotes,
  });
  if (!actualizada) return { ok: false, status: 500, error: "No pudimos guardar el cambio." };

  if (cambiaEstado) await Promise.allSettled([sendEstadoCliente(actualizada)]);
  return { ok: true, reserva: actualizada };
}

/* ---------------------------------- CSV ---------------------------------- */

const CSV_HEADERS = [
  "codigo",
  "estado",
  "fecha",
  "franja",
  "tipo",
  "invitados",
  "nombre",
  "email",
  "telefono",
  "mensaje",
  "notas_admin",
  "origen",
  "ip",
  "creado",
  "actualizado",
] as const;

function csvCell(value: string | number | undefined): string {
  const text = value === undefined ? "" : String(value);
  return `"${text.replace(/"/g, '""').replace(/\r?\n/g, " ")}"`;
}

/** CSV (RFC 4180) con BOM para que Excel respete los acentos. */
export function reservasToCsv(list: readonly Reserva[]): string {
  const rows = list.map((r) =>
    [
      r.code,
      r.status,
      r.date,
      slotLabel(r.slot),
      eventTypeTitle(r.eventType),
      r.guests,
      r.name,
      r.email,
      r.phone,
      r.message,
      r.adminNotes,
      r.source,
      r.ip,
      r.createdAt,
      r.updatedAt,
    ].map(csvCell).join(","),
  );
  return `\uFEFF${CSV_HEADERS.join(",")}\r\n${rows.join("\r\n")}${rows.length > 0 ? "\r\n" : ""}`;
}
