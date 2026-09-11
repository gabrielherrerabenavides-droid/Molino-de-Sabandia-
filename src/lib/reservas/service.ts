/**
 * Casos de uso de reservas: crear una solicitud, consultarla, listarla para
 * administración y cambiar su estado. Solo servidor.
 */
import { ACCESS_TOKEN_RE, accessToken, collection, newId, nowIso, publicCode, type Collection } from "@/lib/store";
import {
  buildMonthAvailability,
  compareIso,
  confirmedSlots,
  isSlotAvailable,
  isSlotBlocked,
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

/**
 * Extrae IP y navegador de la petición para guardarlos con la solicitud.
 * Igual que en `src/lib/rate-limit.ts`, se prefiere `x-real-ip` (la fija Vercel
 * con la IP de la conexión) y solo se recurre a la primera entrada de
 * `x-forwarded-for`, que el cliente puede falsear. Se acota a 45 caracteres
 * antes de guardarla o exportarla.
 */
export function requestMeta(req: Request): RequestMeta {
  const realIp = req.headers.get("x-real-ip")?.trim();
  const forwarded = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = (realIp || forwarded || "").slice(0, 45) || undefined;
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

/**
 * Limitación conocida: el almacén no filtra por mes en SQL, así que `list()` trae
 * la colección y el recorte por mes se hace aquí, en memoria. Con el volumen del
 * molino (decenas de reservas al año) es irrelevante; si creciera, conviene añadir
 * un `listBy("date", …)` con índice en `src/lib/store.ts`.
 */
export async function disponibilidadDelMes(mes: string, now: Date = new Date()): Promise<MesDisponibilidad> {
  const delMes = await store().list((r) => monthOf(r.date) === mes);
  return buildMonthAvailability(mes, toOcupacion(delMes), now);
}

/* -------------------------------- consultas ------------------------------ */

/**
 * Resolución de la constancia pública: solo el token abre `/reservas/<token>`.
 * El código legible (`MS-AAAA-XXXX`) es una referencia para hablar con el molino
 * y no da acceso a nada; por eso no hay búsqueda pública por código.
 */
export async function reservaPorToken(token: string): Promise<Reserva | null> {
  if (!ACCESS_TOKEN_RE.test(token)) return null;
  return store().findBy("token", token);
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

/**
 * Código público que aún no exista. Con 32^4 combinaciones al año la paradoja del
 * cumpleaños muerde pronto, y `findBy("code", …)` devolvería la primera coincidencia:
 * dos clientes compartirían referencia.
 */
async function codigoLibre(): Promise<string> {
  let code = publicCode("MS");
  for (let intento = 0; intento < 5; intento += 1) {
    if ((await store().findBy("code", code)) === null) return code;
    code = publicCode("MS");
  }
  return code;
}

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
    code: await codigoLibre(),
    token: accessToken(),
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
  | { ok: false; status: 404 | 409 | 500; error: string };

/**
 * Cambia el estado y/o las notas internas y avisa al cliente si el estado cambió.
 * Confirmar revalida la disponibilidad: las pendientes no bloquean, así que varias
 * solicitudes pueden acumularse sobre la misma fecha y solo la primera puede confirmarse.
 */
export async function actualizarEstado(id: string, patch: ReservaPatch): Promise<ActualizarResultado> {
  const actual = await store().get(id);
  if (!actual) return { ok: false, status: 404, error: "No encontramos esa reserva." };

  const nuevoEstado = patch.status ?? actual.status;
  const cambiaEstado = actual.status !== nuevoEstado;

  if (nuevoEstado === "confirmada" && cambiaEstado) {
    const otras = (await store().list((r) => r.date === actual.date)).filter((r) => r.id !== id);
    // Se usa `isSlotBlocked` (no `isSlotAvailable`) para no bloquear la confirmación
    // de fechas ya próximas: la antelación mínima solo rige al solicitar.
    if (isSlotBlocked(actual.slot, confirmedSlots(actual.date, toOcupacion(otras)))) {
      return {
        ok: false,
        status: 409,
        error: `Ya hay otro evento confirmado el ${actual.date} en esa franja o en el día completo. Cancela el otro antes de confirmar este.`,
      };
    }
  }

  const actualizada = await store().update(id, {
    status: nuevoEstado,
    // Una cadena vacía debe poder borrar la nota: por eso se mira la clave, no el valor.
    ...("adminNotes" in patch ? { adminNotes: patch.adminNotes ?? "" } : {}),
  });
  if (!actualizada) return { ok: false, status: 500, error: "No pudimos guardar el cambio." };

  if (cambiaEstado) await Promise.allSettled([sendEstadoCliente(actualizada)]);
  return { ok: true, reserva: actualizada };
}

/* -------------------------------- depuración ----------------------------- */

/** Años que se conservan las solicitudes de reserva tras la fecha del evento. */
export const RESERVAS_RETENCION_ANIOS = 2;

/**
 * Fecha de corte (YYYY-MM-DD) en hora de Lima: hoy menos `RESERVAS_RETENCION_ANIOS`.
 * Se resta sobre el año del día de Lima, no sobre el del servidor (que corre en UTC).
 */
export function fechaCorteRetencion(now: Date = new Date()): string {
  const hoy = todayInTimeZone(now);
  const anio = Number(hoy.slice(0, 4)) - RESERVAS_RETENCION_ANIOS;
  return `${String(anio).padStart(4, "0")}${hoy.slice(4)}`;
}

/**
 * Borra las solicitudes cuya fecha de evento sea anterior al corte de retención.
 * Es el cumplimiento material del plazo anunciado en la política de privacidad
 * («las solicitudes de reserva, hasta dos (2) años después de la fecha del
 * evento»). Las hojas del Libro de Reclamaciones NO se tocan: su conservación
 * mínima es de dos años por el D.S. N.º 011-2011-PCM y su depuración se decide
 * a mano, hoja por hoja, cuando el plazo aplicable ha vencido de verdad.
 */
export async function depurarReservasAntiguas(now: Date = new Date()): Promise<{ corte: string; eliminadas: number }> {
  const corte = fechaCorteRetencion(now);
  const caducadas = await store().list((r) => compareIso(r.date, corte) < 0);
  let eliminadas = 0;
  for (const reserva of caducadas) {
    if (await store().remove(reserva.id)) eliminadas += 1;
  }
  return { corte, eliminadas };
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

/**
 * Celda CSV (RFC 4180) a prueba de inyección de fórmulas: Excel, LibreOffice y
 * Sheets evalúan lo que empieza por `=`, `+`, `-`, `@`, tabulador o retorno de
 * carro, y los campos libres los escribe cualquier visitante del formulario.
 * El orden importa: primero se aplanan los controles, luego el apóstrofo y solo
 * al final se duplican las comillas.
 */
function csvCell(value: string | number | undefined): string {
  const plano = (value === undefined ? "" : String(value)).replace(/[\r\n\t]+/g, " ");
  const seguro = /^[=+\-@]/.test(plano) ? `'${plano}` : plano;
  return `"${seguro.replace(/"/g, '""')}"`;
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
