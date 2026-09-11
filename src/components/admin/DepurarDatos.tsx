"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Resultado = { eliminadas: number; corte: string };

/**
 * Depuración manual de solicitudes caducadas (POST /api/admin/depurar).
 * La confirmación es en línea —no `window.confirm`— para que se lea, se pueda
 * cancelar con el teclado y no dependa de un diálogo del navegador.
 */
export function DepurarDatos() {
  const router = useRouter();
  const [confirmando, setConfirmando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abrirRef = useRef<HTMLButtonElement>(null);

  const cancelar = () => {
    setConfirmando(false);
    abrirRef.current?.focus();
  };

  const depurar = async () => {
    setEnviando(true);
    setError(null);
    setResultado(null);
    try {
      const res = await fetch("/api/admin/depurar", { method: "POST", credentials: "same-origin" });
      if (res.status === 401 || res.status === 503) {
        setError("Sesión no autorizada. Recarga la página e inicia sesión de nuevo.");
        return;
      }
      const json: { ok?: boolean; eliminadas?: number; corte?: string; error?: string } = await res
        .json()
        .catch(() => ({}));
      if (!res.ok || json.ok !== true) {
        setError(json.error ?? "No pudimos completar la depuración.");
        return;
      }
      setResultado({ eliminadas: json.eliminadas ?? 0, corte: json.corte ?? "" });
      setConfirmando(false);
      router.refresh();
    } catch {
      setError("No pudimos conectar con el servidor.");
    } finally {
      setEnviando(false);
      abrirRef.current?.focus();
    }
  };

  return (
    <div className="max-w-prose-narrow">
      {confirmando ? (
        <div className="border border-sillar-300 bg-sillar-100 p-4">
          <p className="t-label">Confirmar depuración</p>
          <p className="t-body mt-2 text-volcan-700">
            Se borrarán de forma definitiva las solicitudes de reserva con fecha de evento anterior a hoy menos dos
            años. Las hojas del Libro de Reclamaciones no se tocan: se conservan por obligación legal.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" className="btn btn-primary btn-sm" disabled={enviando} onClick={depurar}>
              {enviando ? "Depurando…" : "Sí, borrar"}
            </button>
            <button type="button" className="btn btn-ghost btn-sm" disabled={enviando} onClick={cancelar}>
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <button
          ref={abrirRef}
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => {
            setResultado(null);
            setError(null);
            setConfirmando(true);
          }}
        >
          Depurar datos antiguos
        </button>
      )}

      <p role="status" className="t-label mt-3 min-h-5">
        {resultado
          ? `${resultado.eliminadas} ${resultado.eliminadas === 1 ? "solicitud eliminada" : "solicitudes eliminadas"} (fecha de evento anterior al ${resultado.corte}).`
          : ""}
      </p>
      {error && (
        <p className="field-error mt-1" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
