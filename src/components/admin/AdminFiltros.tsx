import Link from "next/link";
import { RESERVA_STATUSES, STATUS_LABELS, type ReservaStatus } from "@/lib/reservas/schema";
import { mesLargo } from "@/lib/reservas/format";

/** Filtros por estado y mes. Formulario GET: funciona sin JavaScript. */
export function AdminFiltros({
  status,
  mes,
  meses,
  csvHref,
}: {
  status?: ReservaStatus;
  mes?: string;
  meses: readonly string[];
  csvHref: string;
}) {
  const hayFiltros = Boolean(status || mes);

  return (
    <form method="get" className="flex flex-wrap items-end gap-4">
      <div className="field">
        <label htmlFor="filtro-status">Estado</label>
        <select id="filtro-status" name="status" defaultValue={status ?? ""} className="input min-w-[180px]">
          <option value="">Todos</option>
          {RESERVA_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="filtro-mes">Mes del evento</label>
        <select id="filtro-mes" name="mes" defaultValue={mes ?? ""} className="input min-w-[200px]">
          <option value="">Todos</option>
          {meses.map((m) => (
            <option key={m} value={m}>
              {mesLargo(m)}
            </option>
          ))}
        </select>
      </div>

      <button type="submit" className="btn btn-primary btn-sm">
        Filtrar
      </button>

      {hayFiltros && (
        <Link href="/admin/reservas" className="btn btn-ghost btn-sm">
          Quitar filtros
        </Link>
      )}

      <a href={csvHref} className="btn btn-ghost btn-sm ml-auto" download>
        Exportar CSV
      </a>
    </form>
  );
}
