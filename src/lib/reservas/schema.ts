/**
 * Tipos y validación (zod) de las solicitudes de reserva.
 * Se usa tanto en el cliente (asistente de `/reservas`) como en el servidor.
 */
import { z } from "zod";
import { EVENT_TYPES, SLOT_LABELS, type EventType } from "@/content/site";
import type { Doc } from "@/lib/store";
import {
  RESERVA_STATUSES,
  SLOTS,
  guestsWithinRange,
  isIsoDate,
  isIsoMonth,
  isLeadTimeOk,
  minSelectableDate,
  normalizePhonePe,
  slotAllowed,
  type ReservaStatus,
  type Slot,
} from "@/lib/reservas/availability";

export type { ReservaStatus, Slot };
export { RESERVA_STATUSES, SLOTS };

/** Documento almacenado en la colección `reservas`. */
export type Reserva = Doc & {
  /** Código público legible, p. ej. MS-2026-7K3Q. Es una referencia, NO da acceso a nada. */
  code: string;
  /** Token opaco de 130 bits: es lo único que abre `/reservas/<token>`. Nunca se muestra en la página. */
  token: string;
  /** Slug de `EVENT_TYPES`. */
  eventType: string;
  /** Fecha del evento, YYYY-MM-DD (hora de Lima). */
  date: string;
  slot: Slot;
  guests: number;
  name: string;
  email: string;
  /** Teléfono normalizado a formato internacional, p. ej. +51987654321. */
  phone: string;
  message?: string;
  /** Consentimiento de tratamiento de datos personales (Ley 29733). */
  consent: true;
  status: ReservaStatus;
  source: "web";
  ip?: string;
  userAgent?: string;
  /** Notas internas del molino. NO se publican ni se envían al cliente. */
  adminNotes?: string;
};

export const STATUS_LABELS: Record<ReservaStatus, string> = {
  pendiente: "Pendiente",
  confirmada: "Confirmada",
  cancelada: "Cancelada",
};

export function eventTypeBySlug(slug: string): EventType | null {
  return EVENT_TYPES.find((e) => e.slug === slug) ?? null;
}

export function eventTypeTitle(slug: string): string {
  return eventTypeBySlug(slug)?.title ?? slug;
}

export function slotLabel(slot: Slot): string {
  return SLOT_LABELS[slot];
}

/* ------------------------------- esquemas -------------------------------- */

const nameField = z
  .string()
  .trim()
  .min(2, "Escribe tu nombre y apellido.")
  .max(120, "Como máximo 120 caracteres.");

const emailField = z.email("Escribe un correo electrónico válido.").max(160, "Como máximo 160 caracteres.");

const phoneField = z
  .string()
  .trim()
  .min(6, "Escribe tu teléfono o WhatsApp.")
  .max(30, "Como máximo 30 caracteres.")
  .refine((v) => normalizePhonePe(v) !== null, "Escribe un número del Perú, por ejemplo 987 654 321.")
  .transform((v) => normalizePhonePe(v) ?? v);

const messageField = z.string().trim().max(1200, "Como máximo 1200 caracteres.").optional();

/** Campos de contacto del paso 3, reutilizables en cliente y servidor. */
export const contactoShape = {
  name: nameField,
  email: emailField,
  phone: phoneField,
  message: messageField,
};

/** Campo de invitados acotado al tipo de evento elegido. */
export function guestsField(min: number, max: number) {
  return z.coerce
    .number({ error: "Indica cuántas personas asistirán." })
    .int("Usa un número entero de personas.")
    .min(min, `Para este tipo de evento el mínimo es ${min} ${min === 1 ? "persona" : "personas"}.`)
    .max(max, `Para este tipo de evento el máximo es ${max} personas.`);
}

/** Esquema del paso 3 (datos de contacto + invitados) para validar en el cliente. */
export function datosStepSchema(rules: { minGuests: number; maxGuests: number }) {
  return z.object({ ...contactoShape, guests: guestsField(rules.minGuests, rules.maxGuests) });
}

/** Esquema completo de la solicitud (cuerpo del POST /api/reservas). */
export const reservaInputSchema = z
  .object({
    eventType: z.string().refine((s) => eventTypeBySlug(s) !== null, "Elige un tipo de evento."),
    date: z.string().refine(isIsoDate, "Elige una fecha del calendario."),
    slot: z.enum(SLOTS, { error: "Elige una franja horaria." }),
    guests: guestsField(1, 1000),
    ...contactoShape,
    consent: z.literal(true, "Necesitamos tu autorización para tratar tus datos."),
    terms: z.literal(true, "Debes aceptar los términos y condiciones."),
    /** Trampa antispam: debe llegar vacío. */
    website: z.string().optional(),
  })
  .superRefine((value, ctx) => {
    const tipo = eventTypeBySlug(value.eventType);
    if (tipo) {
      if (!slotAllowed(value.slot, tipo)) {
        ctx.addIssue({
          code: "custom",
          path: ["slot"],
          message: `Para ${tipo.title.toLowerCase()} solo ofrecemos: ${tipo.slots.map((s) => SLOT_LABELS[s]).join(", ")}.`,
        });
      }
      if (!guestsWithinRange(value.guests, tipo)) {
        ctx.addIssue({
          code: "custom",
          path: ["guests"],
          message: `Para ${tipo.title.toLowerCase()} aceptamos entre ${tipo.minGuests} y ${tipo.maxGuests} personas.`,
        });
      }
    }
    if (!isLeadTimeOk(value.date)) {
      ctx.addIssue({
        code: "custom",
        path: ["date"],
        message: `Necesitamos al menos 3 días de antelación: elige una fecha desde el ${minSelectableDate()}.`,
      });
    }
  });

export type ReservaInput = z.output<typeof reservaInputSchema>;

/**
 * Cuerpo del PATCH /api/admin/reservas/[id]. Ambas claves son opcionales para
 * poder guardar las notas internas sin cambiar el estado (y sin avisar al cliente),
 * pero al menos una debe venir.
 */
export const reservaPatchSchema = z
  .object({
    status: z.enum(RESERVA_STATUSES, { error: "Estado no válido." }).optional(),
    adminNotes: z.string().trim().max(2000, "Como máximo 2000 caracteres.").optional(),
  })
  .refine((v) => v.status !== undefined || v.adminNotes !== undefined, {
    error: "Indica un estado o unas notas.",
  });

export type ReservaPatch = z.output<typeof reservaPatchSchema>;

/** Filtros del listado de administración. */
export const reservaFiltroSchema = z.object({
  status: z.enum(RESERVA_STATUSES).optional(),
  mes: z.string().refine(isIsoMonth, "Usa el formato AAAA-MM.").optional(),
});

export type ReservaFiltro = z.output<typeof reservaFiltroSchema>;

/** Primer mensaje de error por campo, listo para pintar bajo cada input. */
export function fieldErrors(error: z.ZodError<unknown>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.map(String).join(".") || "_";
    if (!(key in out)) out[key] = issue.message;
  }
  return out;
}
