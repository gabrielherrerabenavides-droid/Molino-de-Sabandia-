import { clsx } from "clsx";
import { STATUS_LABELS, type ReservaStatus } from "@/lib/reservas/schema";

const PUNTO: Record<ReservaStatus, string> = {
  pendiente: "bg-ocre-500",
  confirmada: "bg-campina-500",
  cancelada: "bg-alerta",
};

/** Estado de una solicitud con punto de color (sin emojis, DESIGN.md §10). */
export function EstadoReserva({ status, className }: { status: ReservaStatus; className?: string }) {
  return (
    <span className={clsx("inline-flex items-center gap-2 t-label whitespace-nowrap", className)}>
      <span aria-hidden className={clsx("inline-block size-2 rounded-full", PUNTO[status])} />
      {STATUS_LABELS[status]}
    </span>
  );
}
