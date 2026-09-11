"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ESTADO_LABELS, type EstadoReclamacion } from "@/lib/reclamaciones/constants";

/**
 * Escribe las observaciones y acciones adoptadas por el proveedor (sección 4 de la
 * Hoja de Reclamación) y marca el estado. Al responder se avisa al consumidor por correo.
 */
export function ReclamacionAcciones({
  id,
  code,
  estado,
  respuesta,
  respondidaEn,
}: {
  id: string;
  code: string;
  estado: EstadoReclamacion;
  respuesta?: string;
  respondidaEn?: string;
}) {
  const router = useRouter();
  const [texto, setTexto] = useState(respuesta ?? "");
  const [pendiente, setPendiente] = useState<EstadoReclamacion | null>(null);
  const [error, setError] = useState<string | null>(null);

  const guardar = async (nuevo: EstadoReclamacion) => {
    if (texto.trim().length < 10) {
      setError("Escribe la respuesta al consumidor (10 caracteres como mínimo).");
      return;
    }
    setPendiente(nuevo);
    setError(null);
    try {
      const res = await fetch(`/api/admin/reclamaciones/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ respuesta: texto.trim(), estado: nuevo }),
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
    <div className="min-w-[260px]">
      <label htmlFor={`respuesta-${id}`} className="t-label block">
        Respuesta a {code}
      </label>
      <textarea
        id={`respuesta-${id}`}
        className="input mt-2 min-h-[96px] text-[0.88rem]"
        rows={4}
        maxLength={4000}
        value={texto}
        placeholder="Observaciones y acciones adoptadas por el proveedor (se envían al consumidor)"
        onChange={(e) => setTexto(e.target.value)}
      />
      <div className="mt-2 flex flex-wrap gap-2">
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          disabled={pendiente !== null}
          onClick={() => guardar("respondida")}
        >
          {pendiente === "respondida" ? "Enviando…" : "Responder y notificar"}
        </button>
        {estado === "respondida" && (
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            disabled={pendiente !== null}
            onClick={() => guardar("pendiente")}
          >
            {pendiente === "pendiente" ? "Guardando…" : "Volver a pendiente"}
          </button>
        )}
      </div>
      <p className="t-label mt-2 !text-[0.72rem]">
        Estado actual: {ESTADO_LABELS[estado]}
        {respondidaEn ? ` · respondida el ${new Date(respondidaEn).toLocaleDateString("es-PE")}` : ""}
      </p>
      {error && (
        <p className="field-error mt-2" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
