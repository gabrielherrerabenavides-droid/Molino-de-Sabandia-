import { clsx } from "clsx";

export type FilaResumen = { label: string; value: string };

/** Resumen en dos columnas con juntas de sillar entre filas. */
export function ResumenReserva({ filas, className }: { filas: readonly FilaResumen[]; className?: string }) {
  return (
    <dl className={clsx("grid gap-x-10 sm:grid-cols-2", className)}>
      {filas.map((fila) => (
        <div key={fila.label} className="border-t border-sillar-300 py-4">
          <dt className="t-label">{fila.label}</dt>
          <dd className="t-body mt-1 text-volcan-900">{fila.value}</dd>
        </div>
      ))}
    </dl>
  );
}
