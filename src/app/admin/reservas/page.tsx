import type { Metadata } from "next";
import { AdminFiltros } from "@/components/admin/AdminFiltros";
import { ReservaAcciones } from "@/components/admin/ReservaAcciones";
import { EstadoReserva } from "@/components/reservas/EstadoReserva";
import { fechaCorta, fechaHora, franjaLabel, mesLargo } from "@/lib/reservas/format";
import { eventTypeTitle, reservaFiltroSchema, STATUS_LABELS, type ReservaStatus } from "@/lib/reservas/schema";
import { contarPorEstado, listarReservas, mesesConReservas } from "@/lib/reservas/service";
import { storageMode } from "@/lib/store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Reservas",
  description: "Listado interno de solicitudes de reserva.",
  robots: { index: false, follow: false, nocache: true },
};

const COLUMNAS = [
  "Código",
  "Fecha",
  "Franja",
  "Tipo",
  "Nombre",
  "Contacto",
  "Invitados",
  "Estado",
  "Creado",
  "Acciones",
];

function unico(valor: string | string[] | undefined): string | undefined {
  const v = Array.isArray(valor) ? valor[0] : valor;
  return v && v.length > 0 ? v : undefined;
}

export default async function AdminReservasPage(props: PageProps<"/admin/reservas">) {
  const search = await props.searchParams;
  const parsed = reservaFiltroSchema.safeParse({ status: unico(search.status), mes: unico(search.mes) });
  const filtro = parsed.success ? parsed.data : {};

  const [reservas, totales, meses] = await Promise.all([
    listarReservas(filtro),
    contarPorEstado(),
    mesesConReservas(),
  ]);

  const csvParams = new URLSearchParams({ format: "csv" });
  if (filtro.status) csvParams.set("status", filtro.status);
  if (filtro.mes) csvParams.set("mes", filtro.mes);

  const resumen: { status: ReservaStatus; total: number }[] = [
    { status: "pendiente", total: totales.pendiente },
    { status: "confirmada", total: totales.confirmada },
    { status: "cancelada", total: totales.cancelada },
  ];

  return (
    <section className="container-site pt-10 pb-[clamp(64px,8vw,120px)]">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1 className="t-display-sm">Solicitudes de reserva</h1>
          <p className="t-body mt-2 text-muted">
            {reservas.length} {reservas.length === 1 ? "solicitud" : "solicitudes"}
            {filtro.mes ? ` de ${mesLargo(filtro.mes).toLowerCase()}` : ""}
            {filtro.status ? ` con estado ${STATUS_LABELS[filtro.status].toLowerCase()}` : ""}.
          </p>
        </div>
        <dl className="flex flex-wrap gap-x-8 gap-y-2">
          {resumen.map((item) => (
            <div key={item.status}>
              <dt className="t-label">
                <EstadoReserva status={item.status} />
              </dt>
              <dd className="t-num-sm mt-1">{item.total}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="mt-8">
        <AdminFiltros
          status={filtro.status}
          mes={filtro.mes}
          meses={meses}
          csvHref={`/api/admin/reservas?${csvParams.toString()}`}
        />
      </div>

      <hr className="stone-rule mt-8" />

      {reservas.length === 0 ? (
        <p className="t-body mt-10 text-muted">
          No hay solicitudes que coincidan con estos filtros.
        </p>
      ) : (
        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[1080px] border-collapse text-left align-top">
            <caption className="sr-only">
              Solicitudes de reserva con su estado y las acciones de administración.
            </caption>
            <thead>
              <tr>
                {COLUMNAS.map((columna) => (
                  <th key={columna} scope="col" className="t-label border-b border-sillar-300 pb-3 pr-6 font-medium">
                    {columna}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reservas.map((reserva) => (
                <tr key={reserva.id} className="align-top">
                  <td className="border-b border-sillar-200 py-5 pr-6">
                    <span className="t-mono-num">{reserva.code}</span>
                  </td>
                  <td className="border-b border-sillar-200 py-5 pr-6 whitespace-nowrap">
                    {fechaCorta(reserva.date)}
                  </td>
                  <td className="border-b border-sillar-200 py-5 pr-6 text-[0.9rem]">{franjaLabel(reserva.slot)}</td>
                  <td className="border-b border-sillar-200 py-5 pr-6 text-[0.9rem]">
                    {eventTypeTitle(reserva.eventType)}
                  </td>
                  <td className="border-b border-sillar-200 py-5 pr-6">{reserva.name}</td>
                  <td className="border-b border-sillar-200 py-5 pr-6 text-[0.88rem]">
                    <a href={`mailto:${reserva.email}`} className="link-line text-ocre-500">
                      {reserva.email}
                    </a>
                    <br />
                    <a href={`tel:${reserva.phone}`} className="link-line">
                      {reserva.phone}
                    </a>
                    {reserva.message && (
                      <span className="mt-2 block max-w-[34ch] text-muted">{reserva.message}</span>
                    )}
                  </td>
                  <td className="border-b border-sillar-200 py-5 pr-6 tabular-nums">{reserva.guests}</td>
                  <td className="border-b border-sillar-200 py-5 pr-6">
                    <EstadoReserva status={reserva.status} />
                  </td>
                  <td className="border-b border-sillar-200 py-5 pr-6 text-[0.82rem] whitespace-nowrap text-muted">
                    {fechaHora(reserva.createdAt)}
                  </td>
                  <td className="border-b border-sillar-200 py-5">
                    <ReservaAcciones
                      id={reserva.id}
                      code={reserva.code}
                      status={reserva.status}
                      adminNotes={reserva.adminNotes}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="t-label mt-10">
        Almacenamiento: {storageMode === "postgres" ? "Neon Postgres" : "archivo local .data/reservas.json"}
      </p>
    </section>
  );
}
