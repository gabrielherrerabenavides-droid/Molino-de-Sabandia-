import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { obtenerReclamacionPorCodigo, formatFecha } from "@/lib/reclamaciones/service";
import { SITE } from "@/content/site";

type Params = { codigo: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { codigo } = await params;
  return {
    title: `Constancia ${codigo.toUpperCase()}`,
    description: "Constancia de hoja de reclamación del Molino de Sabandía.",
    robots: { index: false, follow: false },
  };
}

export default async function ConstanciaReclamacionPage({ params }: { params: Promise<Params> }) {
  const { codigo } = await params;
  const reclamacion = await obtenerReclamacionPorCodigo(codigo);

  if (!reclamacion) {
    notFound();
  }

  const filas: [string, string][] = [
    ["Tipo", reclamacion.tipo],
    ["Nombre completo", reclamacion.nombreCompleto],
    ["Documento", `${reclamacion.tipoDocumento} ${reclamacion.numeroDocumento}`],
    ["Correo", reclamacion.email],
    ["Bien contratado", `${reclamacion.tipoBien} — ${reclamacion.descripcionBien}`],
    ...(reclamacion.montoReclamado
      ? ([["Monto reclamado", `${SITE.currency} ${reclamacion.montoReclamado}`]] as [string, string][])
      : []),
  ];

  return (
    <div className="pt-[calc(var(--header-h)+clamp(40px,7vw,96px))] pb-[clamp(64px,10vw,140px)]">
      <style>{`
        @media print {
          header, footer { display: none !important; }
          body { background: #fff; }
        }
      `}</style>
      <Container>
        <div className="max-w-prose-narrow">
          <Eyebrow tone="ocre" className="mb-4">
            Constancia
          </Eyebrow>
          <h1 className="t-display mb-2 max-w-[18ch]">Hoja de reclamación</h1>
          <p className="t-num text-ocre-500 !text-3xl mb-8">{reclamacion.code}</p>

          <dl className="mb-10 grid gap-x-8 gap-y-4 border border-sillar-300 p-6 sm:grid-cols-2">
            <div>
              <dt className="t-label mb-1">Fecha de presentación</dt>
              <dd className="t-body text-volcan-700">{formatFecha(reclamacion.fecha)}</dd>
            </div>
            {filas.map(([label, value]) => (
              <div key={label}>
                <dt className="t-label mb-1">{label}</dt>
                <dd className="t-body text-volcan-700">{value}</dd>
              </div>
            ))}
          </dl>

          <div className="mb-10">
            <p className="t-label mb-2">Detalle</p>
            <p className="t-body text-volcan-700">{reclamacion.detalle}</p>
          </div>

          <div className="mb-12">
            <p className="t-label mb-2">Pedido del consumidor</p>
            <p className="t-body text-volcan-700">{reclamacion.pedido}</p>
          </div>

          <div className="mb-12 space-y-4 border-y border-sillar-300 py-8">
            <p className="t-body text-volcan-700">
              La formulación del reclamo no impide acudir a otras vías de solución de controversias ni es requisito
              previo para interponer una denuncia ante el INDECOPI.
            </p>
            <p className="t-body text-volcan-700">
              El proveedor debe dar respuesta al reclamo o queja en un plazo no mayor a quince (15) días hábiles, el
              cual es improrrogable. Hemos enviado esta constancia también a tu correo electrónico.
            </p>
          </div>

          <button type="button" id="print-constancia" className="btn btn-ghost print:hidden">
            Imprimir
          </button>
          <script
            // Comportamiento mínimo sin convertir la página en Client Component (DESIGN.md, movimiento §5).
            dangerouslySetInnerHTML={{
              __html:
                "document.getElementById('print-constancia')?.addEventListener('click', function () { window.print(); });",
            }}
          />
        </div>
      </Container>
    </div>
  );
}
