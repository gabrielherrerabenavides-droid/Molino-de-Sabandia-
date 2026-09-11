"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RESERVA_STATUSES, type ReservaStatus } from "@/lib/reservas/schema";

const ACCIONES: { status: ReservaStatus; label: string }[] = [
  { status: "confirmada", label: "Confirmar" },
  { status: "cancelada", label: "Cancelar" },
  { status: "pendiente", label: "Volver a pendiente" },
];

/** Cambia el estado de una reserva (PATCH) y refresca el listado del servidor. */
export function ReservaAcciones({
  id,
  code,
  status,
  adminNotes,
}: {
  id: string;
  code: string;
  status: ReservaStatus;
  adminNotes?: string;
}) {
  const router = useRouter();
  const [notas, setNotas] = useState(adminNotes ?? "");
  const [pendiente, setPendiente] = useState<ReservaStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  const cambiar = async (nuevo: ReservaStatus) => {
    setPendiente(nuevo);
    setError(null);
    try {
      const res = await fetch(`/api/admin/reservas/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ status: nuevo, adminNotes: notas.trim() === "" ? undefined : notas.trim() }),
      });
      if (res.status === 401 || res.status === 503) {
        setError("Sesión no autorizada. Recarga la página e inicia sesión de nuevo.");
        setPendiente(null);
        return;
      }
      if (!res.ok) {
        const json: { error?: string } = await res.json().catch(() => ({}));
        setError(json.error ?? "No pudimos guardar el cambio.");
        setPendiente(null);
        return;
      }
      router.refresh();
      setPendiente(null);
    } catch {
      setError("No pudimos conectar con el servidor.");
      setPendiente(null);
    }
  };

  return (
    <div className="min-w-[230px]">
      <label htmlFor={`notas-${id}`} className="t-label block">
        Notas de {code}
      </label>
      <textarea
        id={`notas-${id}`}
        className="input mt-2 min-h-[64px] text-[0.88rem]"
        rows={2}
        maxLength={2000}
        value={notas}
        placeholder="Notas internas (se envían al cliente al cambiar el estado)"
        onChange={(e) => setNotas(e.target.value)}
      />
      <div className="mt-2 flex flex-wrap gap-2">
        {ACCIONES.filter((a) => a.status !== status).map((accion) => (
          <button
            key={accion.status}
            type="button"
            className="btn btn-ghost btn-sm"
            disabled={pendiente !== null}
            onClick={() => cambiar(accion.status)}
          >
            {pendiente === accion.status ? "Guardando…" : accion.label}
          </button>
        ))}
      </div>
      {error && (
        <p className="field-error mt-2" role="alert">
          {error}
        </p>
      )}
      <span className="sr-only">Estados posibles: {RESERVA_STATUSES.join(", ")}.</span>
    </div>
  );
}
