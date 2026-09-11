import Link from "next/link";
import { ReclamacionAcciones } from "@/components/admin/ReclamacionAcciones";
import { ESTADOS_RECLAMACION, ESTADO_LABELS, type EstadoReclamacion } from "@/lib/reclamaciones/constants";
import { reclamacionFiltroSchema } from "@/lib/reclamaciones/schema";
import { contarReclamacionesPorEstado, formatFecha, listarReclamaciones } from "@/lib/reclamaciones/service";
import { fechaHora } from "@/lib/reservas/format";
import { pageMetadata } from "@/lib/seo";
import { storageLabel } from "@/lib/store";
import { SITE } from "@/content/site";

export const dynamic = "force-dynamic";

export const metadata = pageMetadata({
  title: "Reclamaciones",
  description: "Listado interno de hojas del Libro de Reclamaciones.",
  path: "/admin/reclamaciones",
  noindex: true,
});

const COLUMNAS = ["Hoja", "Fecha", "Tipo", "Consumidor", "Contacto", "Detalle", "Estado", "Creado", "Respuesta"];

function unico(valor: string | string[] | undefined): string | undefined {
  const v = Array.isArray(valor) ? valor[0] : valor;
  return v && v.length > 0 ? v : undefined;
}

export default async function AdminReclamacionesPage(props: PageProps<"/admin/reclamaciones">) {
  const search = await props.searchParams;
  const parsed = reclamacionFiltroSchema.safeParse({ estado: unico(search.estado) });
  const filtro = parsed.success ? parsed.data : {};

  const [reclamaciones, totales] = await Promise.all([listarReclamaciones(filtro), contarReclamacionesPorEstado()]);

  const csvParams = new URLSearchParams({ format: "csv" });
  if (filtro.estado) csvParams.set("estado", filtro.estado);

  return (
    <section className="container-site pt-10 pb-[clamp(64px,8vw,120px)]">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1 className="t-display-sm">Libro de Reclamaciones</h1>
          <p className="t-body mt-2 text-muted">
            {reclamaciones.length} {reclamaciones.length === 1 ? "hoja" : "hojas"}
            {filtro.estado ? ` con estado ${ESTADO_LABELS[filtro.estado].toLowerCase()}` : ""}. El plazo de respuesta es
            de 15 días hábiles improrrogables.
          </p>
        </div>
        <dl className="flex flex-wrap gap-x-8 gap-y-2">
          {ESTADOS_RECLAMACION.map((estado: EstadoReclamacion) => (
            <div key={estado}>
              <dt className="t-label">{ESTADO_LABELS[estado]}</dt>
              <dd className="t-num-sm mt-1">{totales[estado]}</dd>
            </div>
          ))}
        </dl>
      </div>

      <form method="get" className="mt-8 flex flex-wrap items-end gap-4">
        <div className="field">
          <label htmlFor="filtro-estado">Estado</label>
          <select id="filtro-estado" name="estado" defaultValue={filtro.estado ?? ""} className="input min-w-[180px]">
            <option value="">Todos</option>
            {ESTADOS_RECLAMACION.map((estado) => (
              <option key={estado} value={estado}>
                {ESTADO_LABELS[estado]}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn btn-primary btn-sm">
          Filtrar
        </button>
        {filtro.estado && (
          <Link href="/admin/reclamaciones" className="btn btn-ghost btn-sm">
            Quitar filtros
          </Link>
        )}
        <a href={`/api/admin/reclamaciones?${csvParams.toString()}`} className="btn btn-ghost btn-sm ml-auto" download>
          Exportar CSV
        </a>
      </form>

      <hr className="stone-rule mt-8" />

      {reclamaciones.length === 0 ? (
        <p className="t-body mt-10 text-muted">No hay hojas que coincidan con este filtro.</p>
      ) : (
        <div className="relative mt-8 overflow-x-auto">
          <table className="w-full min-w-[1120px] border-collapse text-left align-top">
            <caption className="sr-only">
              Hojas del Libro de Reclamaciones con su estado y la respuesta del proveedor.
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
              {reclamaciones.map((hoja) => (
                <tr key={hoja.id} className="align-top">
                  <td className="border-b border-sillar-200 py-5 pr-6">
                    <span className="t-mono-num">{hoja.code}</span>
                  </td>
                  <td className="border-b border-sillar-200 py-5 pr-6 whitespace-nowrap">{formatFecha(hoja.fecha)}</td>
                  <td className="border-b border-sillar-200 py-5 pr-6 text-[0.9rem]">{hoja.tipo}</td>
                  <td className="border-b border-sillar-200 py-5 pr-6">
                    {hoja.nombreCompleto}
                    <span className="mt-1 block text-[0.82rem] text-muted">
                      {hoja.tipoDocumento} {hoja.numeroDocumento}
                    </span>
                    {hoja.esMenorDeEdad && hoja.nombreTutor && (
                      <span className="mt-1 block text-[0.82rem] text-muted">Tutor: {hoja.nombreTutor}</span>
                    )}
                  </td>
                  <td className="border-b border-sillar-200 py-5 pr-6 text-[0.88rem]">
                    <a href={`mailto:${hoja.email}`} className="link-line text-ocre-500">
                      {hoja.email}
                    </a>
                    <br />
                    <a href={`tel:${hoja.telefono}`} className="link-line">
                      {hoja.telefono}
                    </a>
                    <span className="mt-2 block max-w-[28ch] text-muted">{hoja.domicilio}</span>
                  </td>
                  <td className="border-b border-sillar-200 py-5 pr-6 text-[0.88rem]">
                    <span className="block max-w-[38ch] text-volcan-700">{hoja.detalle}</span>
                    <span className="mt-2 block max-w-[38ch] text-muted">Pedido: {hoja.pedido}</span>
                    <span className="mt-2 block text-muted">
                      {hoja.tipoBien} · {hoja.descripcionBien}
                      {hoja.montoReclamado ? ` · ${SITE.currency} ${hoja.montoReclamado}` : ""}
                    </span>
                  </td>
                  <td className="border-b border-sillar-200 py-5 pr-6 whitespace-nowrap">
                    {ESTADO_LABELS[hoja.estado]}
                    <span className="mt-1 block text-[0.8rem] text-muted">
                      Copia por correo: {hoja.emailEnviado ? "enviada" : "no enviada"}
                    </span>
                  </td>
                  <td className="border-b border-sillar-200 py-5 pr-6 text-[0.82rem] whitespace-nowrap text-muted">
                    {fechaHora(hoja.createdAt)}
                  </td>
                  <td className="border-b border-sillar-200 py-5">
                    <ReclamacionAcciones
                      id={hoja.id}
                      code={hoja.code}
                      estado={hoja.estado}
                      respuesta={hoja.respuesta}
                      respondidaEn={hoja.respondidaEn}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="t-label mt-10 [overflow-wrap:anywhere]">
        Almacenamiento: {storageLabel("reclamaciones")} · Las
        hojas deben conservarse dos años como mínimo (D.S. N.º 011-2011-PCM).
      </p>
    </section>
  );
}
