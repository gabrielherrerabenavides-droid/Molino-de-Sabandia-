"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RESERVA_STATUSES, type ReservaStatus } from "@/lib/reservas/schema";

const ACCIONES: { status: ReservaStatus; label: string }[] = [
  { status: "confirmada", label: "Confirmar" },
  { status: "cancelada", label: "Cancelar" },
  { status: "pendiente", label: "Volver a pendiente" },
];

/**
 * Cambia el estado de una reserva (PATCH) y refresca el listado del servidor.
 * Las notas son internas: no se publican ni se envían al cliente, y se pueden
 * guardar sin tocar el estado (por tanto sin disparar ningún correo).
 */
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
  const [pendiente, setPendiente] = useState<ReservaStatus | "notas" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [guardado, setGuardado] = useState(false);

  const enviar = async (accion: ReservaStatus | "notas") => {
    setPendiente(accion);
    setError(null);
    setGuardado(false);
    try {
      const res = await fetch(`/api/admin/reservas/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          ...(accion === "notas" ? {} : { status: accion }),
          adminNotes: notas.trim(),
        }),
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
      if (accion === "notas") setGuardado(true);
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
        Notas internas de {code}
      </label>
      <textarea
        id={`notas-${id}`}
        className="input mt-2 min-h-[64px] sm:text-[0.88rem]"
        rows={2}
        maxLength={2000}
        value={notas}
        placeholder="Solo para el molino: no se publican ni se envían al cliente"
        onChange={(e) => {
          setNotas(e.target.value);
          setGuardado(false);
        }}
      />
      <div className="mt-2 flex flex-wrap gap-2">
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          disabled={pendiente !== null}
          onClick={() => enviar("notas")}
        >
          {pendiente === "notas" ? "Guardando…" : "Guardar notas"}
        </button>
        {ACCIONES.filter((a) => a.status !== status).map((accion) => (
          <button
            key={accion.status}
            type="button"
            className="btn btn-ghost btn-sm"
            disabled={pendiente !== null}
            onClick={() => enviar(accion.status)}
          >
            {pendiente === accion.status ? "Guardando…" : accion.label}
          </button>
        ))}
      </div>
      <p role="status" className="t-label mt-2 min-h-5">
        {guardado ? "Notas guardadas." : ""}
      </p>
      {error && (
        <p className="field-error mt-1" role="alert">
          {error}
        </p>
      )}
      <span className="sr-only">Estados posibles: {RESERVA_STATUSES.join(", ")}.</span>
    </div>
  );
}
