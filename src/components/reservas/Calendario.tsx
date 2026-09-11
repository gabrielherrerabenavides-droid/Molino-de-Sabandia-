"use client";

import { useEffect, useMemo, useState } from "react";
import { clsx } from "clsx";
import { eachDayOfInterval, endOfMonth, endOfWeek, startOfWeek } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { dayHasAllowedSlot, type MesDisponibilidad, type Slot } from "@/lib/reservas/availability";
import { fechaLarga, fromIso, mesLargo, toIso } from "@/lib/reservas/format";

const DIAS = ["L", "M", "X", "J", "V", "S", "D"];
/** Cuántos meses hacia adelante se puede navegar. */
const MESES_VISTA = 24;

export function desplazarMes(mes: string, delta: number): string {
  const [y, m] = mes.split("-").map(Number);
  const total = (y * 12 + (m - 1)) + delta;
  return `${Math.floor(total / 12)}-${String((total % 12) + 1).padStart(2, "0")}`;
}

/**
 * Carga la disponibilidad de un mes desde la API.
 * `recarga` fuerza un refetch del mismo mes (por ejemplo tras un 409 al enviar):
 * la clave compuesta hace que las celdas vuelvan a "cargando" mientras llega.
 */
export function useDisponibilidad(mes: string, activo: boolean, recarga = 0) {
  const clave = `${mes}#${recarga}`;
  const [respuesta, setRespuesta] = useState<{ clave: string; data: MesDisponibilidad | null; error: string | null }>({
    clave: "",
    data: null,
    error: null,
  });

  useEffect(() => {
    if (!activo) return;
    const ctrl = new AbortController();
    fetch(`/api/reservas/disponibilidad?mes=${mes}`, { signal: ctrl.signal, headers: { accept: "application/json" } })
      .then((res) => {
        if (!res.ok) throw new Error("respuesta no válida");
        return res.json() as Promise<MesDisponibilidad>;
      })
      .then((json) => setRespuesta({ clave, data: json, error: null }))
      .catch(() => {
        if (ctrl.signal.aborted) return;
        setRespuesta({
          clave,
          data: null,
          error: "No pudimos cargar el calendario. Revisa tu conexión e inténtalo de nuevo.",
        });
      });
    return () => ctrl.abort();
  }, [clave, mes, activo]);

  const alDia = respuesta.clave === clave;
  return {
    data: alDia ? respuesta.data : null,
    cargando: activo && !alDia,
    error: alDia ? respuesta.error : null,
  };
}

type Props = {
  mes: string;
  onMes: (mes: string) => void;
  data: MesDisponibilidad | null;
  cargando: boolean;
  error: string | null;
  slotsPermitidos: readonly Slot[];
  seleccion: string | null;
  onSeleccion: (date: string) => void;
};

export function Calendario({ mes, onMes, data, cargando, error, slotsPermitidos, seleccion, onSeleccion }: Props) {
  const celdas = useMemo(() => {
    const primero = fromIso(`${mes}-01`);
    return eachDayOfInterval({
      start: startOfWeek(primero, { weekStartsOn: 1 }),
      end: endOfWeek(endOfMonth(primero), { weekStartsOn: 1 }),
    }).map(toIso);
  }, [mes]);

  const porFecha = useMemo(() => new Map((data?.days ?? []).map((d) => [d.date, d])), [data]);

  const mesMin = data ? data.minDate.slice(0, 7) : mes;
  const mesMax = desplazarMes(mesMin, MESES_VISTA);
  const puedeAtras = mes > mesMin;
  const puedeAdelante = mes < mesMax;

  // Red de seguridad si el reloj del navegador va por detrás del servidor: nunca
  // se muestra un mes anterior al primero solicitable (quedaría todo en gris).
  useEffect(() => {
    if (data && mes < data.minDate.slice(0, 7)) onMes(data.minDate.slice(0, 7));
  }, [data, mes, onMes]);

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => onMes(desplazarMes(mes, -1))}
          disabled={!puedeAtras}
          aria-label="Mes anterior"
          className="grid size-11 place-items-center border border-sillar-300 text-volcan-900 transition-colors duration-300 hover:border-volcan-950 disabled:opacity-35 disabled:hover:border-sillar-300"
        >
          <ChevronLeft aria-hidden className="size-4" />
        </button>
        <p aria-live="polite" className="t-h3 text-center">
          {mesLargo(mes)}
        </p>
        <button
          type="button"
          onClick={() => onMes(desplazarMes(mes, 1))}
          disabled={!puedeAdelante}
          aria-label="Mes siguiente"
          className="grid size-11 place-items-center border border-sillar-300 text-volcan-900 transition-colors duration-300 hover:border-volcan-950 disabled:opacity-35 disabled:hover:border-sillar-300"
        >
          <ChevronRight aria-hidden className="size-4" />
        </button>
      </div>

      <hr className="stone-rule mt-4" />

      <div className="mt-4 grid grid-cols-7 gap-px" role="group" aria-label={`Disponibilidad de ${mesLargo(mes)}`}>
        {DIAS.map((d, i) => (
          <div key={`${d}-${i}`} className="t-label pb-2 text-center text-[0.68rem]" aria-hidden>
            {d}
          </div>
        ))}

        {celdas.map((iso) => {
          if (iso.slice(0, 7) !== mes) return <div key={iso} aria-hidden className="aspect-square" />;

          const dia = porFecha.get(iso);
          const numero = Number(iso.slice(8));
          const cargandoCelda = !dia && (cargando || !data);
          const libre = dia ? dayHasAllowedSlot(dia, slotsPermitidos) : false;
          const fueraDePlazo = dia?.fueraDePlazo ?? false;
          const ocupado = Boolean(dia) && !libre && !fueraDePlazo;
          const elegido = seleccion === iso;

          const estadoTexto = cargandoCelda
            ? "cargando"
            : fueraDePlazo
              ? "sin antelación suficiente"
              : ocupado
                ? "no disponible"
                : dia?.solicitado
                  ? "disponible, con otra solicitud pendiente"
                  : "disponible";

          return (
            <button
              key={iso}
              type="button"
              disabled={!libre}
              aria-pressed={elegido}
              aria-label={`${fechaLarga(iso)}: ${estadoTexto}`}
              onClick={() => onSeleccion(iso)}
              className={clsx(
                "relative aspect-square min-h-11 border text-[0.95rem] transition-colors duration-300",
                elegido
                  ? "border-volcan-950 bg-volcan-950 text-sillar-50"
                  : libre
                    ? "border-sillar-300 bg-white text-volcan-900 hover:border-volcan-950"
                    : "cursor-not-allowed border-transparent bg-transparent text-muted/55",
                ocupado && "line-through",
              )}
            >
              <span className={clsx(cargandoCelda && "opacity-35")}>{numero}</span>
              {dia?.solicitado && libre && (
                <span
                  aria-hidden
                  className={clsx(
                    "absolute bottom-1.5 left-1/2 size-1.5 -translate-x-1/2 rounded-full",
                    elegido ? "bg-ocre-300" : "bg-ocre-500",
                  )}
                />
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2">
        <span className="t-label flex items-center gap-2">
          <span aria-hidden className="inline-block size-1.5 rounded-full bg-ocre-500" />
          Solicitado por otra persona
        </span>
        <span className="t-label flex items-center gap-2">
          <span aria-hidden className="inline-block h-px w-4 bg-muted" />
          No disponible
        </span>
      </div>

      <p aria-live="polite" className="t-label mt-3 min-h-5">
        {error ? (
          <span className="text-alerta">{error}</span>
        ) : cargando ? (
          "Cargando disponibilidad…"
        ) : data && data.days.every((d) => d.fueraDePlazo) ? (
          `La primera fecha disponible es el ${fechaLarga(data.minDate)}.`
        ) : (
          ""
        )}
      </p>
    </div>
  );
}
