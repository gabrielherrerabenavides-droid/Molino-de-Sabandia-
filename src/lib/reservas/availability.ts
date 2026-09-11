/**
 * Reglas de disponibilidad de reservas del molino.
 *
 * Este módulo es deliberadamente puro y SIN dependencias (ni Next, ni zod, ni
 * date-fns): así puede ejecutarse tal cual en el navegador, en el servidor y en
 * las pruebas (`node --experimental-strip-types src/lib/reservas/availability.test.ts`).
 *
 * Reglas (ver AGENT-BRIEF):
 *  - Solo se aceptan fechas a partir de hoy + LEAD_DAYS días, en hora de Lima.
 *  - Una reserva CONFIRMADA de "dia" bloquea todas las franjas de ese día.
 *  - Una reserva CONFIRMADA de "manana"/"tarde" bloquea esa franja y el "dia".
 *  - Las reservas PENDIENTES no bloquean: solo se señalan como "solicitado".
 */

export const SLOTS = ["manana", "tarde", "dia"] as const;
export type Slot = (typeof SLOTS)[number];

export const RESERVA_STATUSES = ["pendiente", "confirmada", "cancelada"] as const;
export type ReservaStatus = (typeof RESERVA_STATUSES)[number];

/** Antelación mínima (en días) para solicitar una fecha. */
export const LEAD_DAYS = 3;
/** Zona horaria de referencia del molino. */
export const TIMEZONE = "America/Lima";

/** Ocupación mínima que necesitan las reglas: una fila por reserva existente. */
export type Ocupacion = { date: string; slot: Slot; status: ReservaStatus };

export type SlotFlags = Record<Slot, boolean>;

export type DiaDisponibilidad = {
  /** Fecha en formato YYYY-MM-DD. */
  date: string;
  /** Día anterior a la antelación mínima: no se puede solicitar. */
  fueraDePlazo: boolean;
  /** Existe al menos una solicitud pendiente ese día (indicador, no bloqueo). */
  solicitado: boolean;
  /** Disponibilidad por franja. */
  slots: SlotFlags;
};

export type MesDisponibilidad = {
  /** Mes consultado, YYYY-MM. */
  mes: string;
  /** Primera fecha solicitable (hoy + LEAD_DAYS en hora de Lima). */
  minDate: string;
  days: DiaDisponibilidad[];
};

/** Restricciones del tipo de evento (subconjunto de `EventType` de site.ts). */
export type EventTypeRules = {
  minGuests: number;
  maxGuests: number;
  slots: readonly Slot[];
};

/* ------------------------------- fechas ---------------------------------- */

const ISO_DATE = /^\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01])$/;
const ISO_MONTH = /^\d{4}-(?:0[1-9]|1[0-2])$/;
const DAY_MS = 86_400_000;

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

/** Convierte YYYY-MM-DD a milisegundos UTC; null si la fecha no existe. */
function isoToUtc(iso: string): number | null {
  if (!ISO_DATE.test(iso)) return null;
  const [y, m, d] = iso.split("-").map(Number);
  const ms = Date.UTC(y, m - 1, d);
  const back = new Date(ms);
  if (back.getUTCFullYear() !== y || back.getUTCMonth() !== m - 1 || back.getUTCDate() !== d) return null;
  return ms;
}

function utcToIso(ms: number): string {
  const d = new Date(ms);
  return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`;
}

export function isIsoDate(value: unknown): value is string {
  return typeof value === "string" && isoToUtc(value) !== null;
}

export function isIsoMonth(value: unknown): value is string {
  return typeof value === "string" && ISO_MONTH.test(value);
}

/** Suma días a una fecha YYYY-MM-DD sin depender de la zona horaria local. */
export function addDaysIso(iso: string, days: number): string {
  const ms = isoToUtc(iso);
  if (ms === null) throw new Error(`Fecha inválida: ${iso}`);
  return utcToIso(ms + days * DAY_MS);
}

/** Comparación lexicográfica (válida para YYYY-MM-DD). */
export function compareIso(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

/** Mes (YYYY-MM) al que pertenece una fecha. */
export function monthOf(iso: string): string {
  return iso.slice(0, 7);
}

/** Fecha de hoy (YYYY-MM-DD) en hora de Lima. */
export function todayInTimeZone(now: Date = new Date(), timeZone: string = TIMEZONE): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

/** Primera fecha que se puede solicitar. */
export function minSelectableDate(now: Date = new Date()): string {
  return addDaysIso(todayInTimeZone(now), LEAD_DAYS);
}

/** ¿La fecha respeta la antelación mínima? */
export function isLeadTimeOk(date: string, now: Date = new Date()): boolean {
  return isIsoDate(date) && compareIso(date, minSelectableDate(now)) >= 0;
}

/** Todas las fechas de un mes YYYY-MM, en orden. */
export function daysOfMonth(mes: string): string[] {
  if (!isIsoMonth(mes)) throw new Error(`Mes inválido: ${mes}`);
  const [y, m] = mes.split("-").map(Number);
  const total = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const out: string[] = [];
  for (let d = 1; d <= total; d += 1) out.push(`${mes}-${pad2(d)}`);
  return out;
}

/* ---------------------------- disponibilidad ------------------------------ */

/** Franjas ya confirmadas en una fecha. */
export function confirmedSlots(date: string, ocupacion: readonly Ocupacion[]): Slot[] {
  return ocupacion.filter((o) => o.date === date && o.status === "confirmada").map((o) => o.slot);
}

/** ¿Hay alguna solicitud pendiente en esa fecha? */
export function hasPending(date: string, ocupacion: readonly Ocupacion[]): boolean {
  return ocupacion.some((o) => o.date === date && o.status === "pendiente");
}

/** ¿La franja está bloqueada por las confirmadas del día? */
export function isSlotBlocked(slot: Slot, confirmadas: readonly Slot[]): boolean {
  if (confirmadas.length === 0) return false;
  if (confirmadas.includes("dia")) return true; // el día completo bloquea todo
  if (slot === "dia") return true; // cualquier confirmada impide el día completo
  return confirmadas.includes(slot);
}

/** Disponibilidad de las tres franjas en una fecha. */
export function slotFlags(
  date: string,
  ocupacion: readonly Ocupacion[],
  now: Date = new Date(),
): SlotFlags {
  const fueraDePlazo = !isLeadTimeOk(date, now);
  const confirmadas = confirmedSlots(date, ocupacion);
  const flags = { manana: false, tarde: false, dia: false };
  for (const slot of SLOTS) flags[slot] = !fueraDePlazo && !isSlotBlocked(slot, confirmadas);
  return flags;
}

export function isSlotAvailable(
  date: string,
  slot: Slot,
  ocupacion: readonly Ocupacion[],
  now: Date = new Date(),
): boolean {
  return slotFlags(date, ocupacion, now)[slot];
}

export function dayAvailability(
  date: string,
  ocupacion: readonly Ocupacion[],
  now: Date = new Date(),
): DiaDisponibilidad {
  return {
    date,
    fueraDePlazo: !isLeadTimeOk(date, now),
    solicitado: hasPending(date, ocupacion),
    slots: slotFlags(date, ocupacion, now),
  };
}

/** Disponibilidad de todo un mes, lista para el calendario del asistente. */
export function buildMonthAvailability(
  mes: string,
  ocupacion: readonly Ocupacion[],
  now: Date = new Date(),
): MesDisponibilidad {
  const delMes = ocupacion.filter((o) => monthOf(o.date) === mes);
  return {
    mes,
    minDate: minSelectableDate(now),
    days: daysOfMonth(mes).map((date) => dayAvailability(date, delMes, now)),
  };
}

/* ------------------------- reglas del tipo de evento ---------------------- */

export function slotAllowed(slot: Slot, rules: EventTypeRules): boolean {
  return rules.slots.includes(slot);
}

export function guestsWithinRange(guests: number, rules: EventTypeRules): boolean {
  return Number.isInteger(guests) && guests >= rules.minGuests && guests <= rules.maxGuests;
}

/** ¿Alguna de las franjas permitidas por el tipo de evento está libre ese día? */
export function dayHasAllowedSlot(day: DiaDisponibilidad, allowed: readonly Slot[]): boolean {
  return allowed.some((slot) => day.slots[slot]);
}

/** Normaliza un teléfono peruano a formato internacional (+51…). */
export function normalizePhonePe(input: string): string | null {
  const digits = input.replace(/\D/g, "");
  let national = digits;
  if (national.startsWith("0051")) national = national.slice(4);
  else if (national.startsWith("51") && national.length >= 10) national = national.slice(2);
  national = national.replace(/^0+/, "");
  if (national.length < 8 || national.length > 9) return null;
  return `+51${national}`;
}
