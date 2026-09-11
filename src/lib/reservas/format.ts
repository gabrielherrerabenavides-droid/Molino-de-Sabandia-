/**
 * Formato de fechas de reservas en español de Perú.
 * Las fechas se guardan como "fecha simple" (YYYY-MM-DD, hora de Lima): para
 * mostrarlas se materializan como medianoche local, de modo que el día nunca
 * se desplaza por la zona horaria del navegador.
 */
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { SLOT_LABELS } from "@/content/site";
import type { Slot } from "@/lib/reservas/availability";

/** YYYY-MM-DD → Date en medianoche local (sin desplazamientos de zona). */
export function fromIso(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

/** Date → YYYY-MM-DD leyendo los componentes locales. */
export function toIso(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

function conMayuscula(texto: string): string {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

/** "Sábado 10 de octubre de 2026" */
export function fechaLarga(iso: string): string {
  return conMayuscula(format(fromIso(iso), "EEEE d 'de' MMMM 'de' yyyy", { locale: es }));
}

/** "10 oct 2026" */
export function fechaCorta(iso: string): string {
  return format(fromIso(iso), "d MMM yyyy", { locale: es });
}

/** "Octubre de 2026" a partir de un mes YYYY-MM. */
export function mesLargo(mes: string): string {
  return conMayuscula(format(fromIso(`${mes}-01`), "MMMM 'de' yyyy", { locale: es }));
}

/** Marca de tiempo ISO completa → "11/09/2026 · 10:32" */
export function fechaHora(isoDateTime: string): string {
  const d = new Date(isoDateTime);
  if (Number.isNaN(d.getTime())) return isoDateTime;
  return format(d, "dd/MM/yyyy · HH:mm");
}

export function franjaLabel(slot: Slot): string {
  return SLOT_LABELS[slot];
}
