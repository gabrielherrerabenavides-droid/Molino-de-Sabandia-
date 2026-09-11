"use client";

import { clsx } from "clsx";
import { SLOT_LABELS } from "@/content/site";
import { Calendario } from "@/components/reservas/Calendario";
import type { MesDisponibilidad, Slot } from "@/lib/reservas/availability";
import { fechaLarga } from "@/lib/reservas/format";

type Props = {
  mes: string;
  onMes: (mes: string) => void;
  disponibilidad: MesDisponibilidad | null;
  cargando: boolean;
  error: string | null;
  slotsPermitidos: readonly Slot[];
  fecha: string | null;
  slot: Slot | null;
  onFecha: (date: string) => void;
  onSlot: (slot: Slot) => void;
  errorFecha?: string;
};

/** Paso 2: calendario mensual y franja horaria. */
export function PasoFecha({
  mes,
  onMes,
  disponibilidad,
  cargando,
  error,
  slotsPermitidos,
  fecha,
  slot,
  onFecha,
  onSlot,
  errorFecha,
}: Props) {
  const dia = fecha ? disponibilidad?.days.find((d) => d.date === fecha) : undefined;

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,320px)] lg:gap-14">
      <div>
        <h2 className="t-h2 mb-2">¿Qué día?</h2>
        <p className="t-body max-w-prose-narrow mb-8 text-muted">
          Necesitamos al menos tres días de antelación. Las fechas tachadas ya están ocupadas.
        </p>
        <Calendario
          mes={mes}
          onMes={onMes}
          data={disponibilidad}
          cargando={cargando}
          error={error}
          slotsPermitidos={slotsPermitidos}
          seleccion={fecha}
          onSeleccion={onFecha}
        />
      </div>

      <div className="lg:pt-2">
        <p className="t-label mb-3">Fecha elegida</p>
        <p className="t-caption min-h-[2.2em] text-volcan-900">
          {fecha ? fechaLarga(fecha) : "Todavía sin elegir"}
        </p>

        <hr className="stone-rule my-7" />

        <fieldset>
          <legend className="t-label mb-3">Franja horaria</legend>
          <div className="flex flex-col gap-px">
            {slotsPermitidos.map((opcion) => {
              const libre = dia ? dia.slots[opcion] : true;
              const elegido = slot === opcion;
              return (
                <button
                  key={opcion}
                  type="button"
                  onClick={() => onSlot(opcion)}
                  disabled={!fecha || !libre}
                  aria-pressed={elegido}
                  className={clsx(
                    "flex min-h-12 items-center justify-between gap-3 border px-4 py-3 text-left text-[0.95rem] transition-colors duration-300",
                    elegido
                      ? "border-volcan-950 bg-volcan-950 text-sillar-50"
                      : !fecha || !libre
                        ? "cursor-not-allowed border-sillar-200 bg-transparent text-muted/60"
                        : "border-sillar-300 bg-white hover:border-volcan-950",
                  )}
                >
                  <span className={clsx(fecha && !libre && "line-through")}>{SLOT_LABELS[opcion]}</span>
                  {fecha && !libre && <span className="t-label text-muted/70">Ocupada</span>}
                </button>
              );
            })}
          </div>
        </fieldset>

        {errorFecha && (
          <p className="field-error mt-4" role="alert">
            {errorFecha}
          </p>
        )}

        {dia?.solicitado && (
          <p className="mt-5 border-l border-ocre-500 pl-4 text-[0.86rem] leading-snug text-muted">
            Ya hay otra solicitud pendiente para ese día. Puedes pedirlo igual: confirmamos por orden de llegada.
          </p>
        )}
      </div>
    </div>
  );
}
