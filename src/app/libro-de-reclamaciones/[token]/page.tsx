import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import {
  enmascararDocumento,
  enmascararEmail,
  enmascararTelefono,
  formatFecha,
  obtenerReclamacionPorToken,
} from "@/lib/reclamaciones/service";
import { PLAZO_RESPUESTA } from "@/lib/reclamaciones/constants";
import { ACCESS_TOKEN_RE } from "@/lib/store";
import { SITE } from "@/content/site";

/** La constancia contiene datos personales: nunca se cachea ni se indexa. */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Constancia de hoja de reclamación",
  description: "Constancia de hoja de reclamación del Molino de Sabandía.",
  robots: { index: false, follow: false, nocache: true },
};

export default async function ConstanciaReclamacionPage(props: PageProps<"/libro-de-reclamaciones/[token]">) {
  const { token } = await props.params;

  if (!ACCESS_TOKEN_RE.test(token)) notFound();
  const reclamacion = await obtenerReclamacionPorToken(token);
  if (!reclamacion || reclamacion.token !== token) notFound();

  const filas: [string, string][] = [
    ["Tipo", reclamacion.tipo],
    ["Nombre completo", reclamacion.nombreCompleto],
    ["Documento", enmascararDocumento(reclamacion.tipoDocumento, reclamacion.numeroDocumento)],
    ["Teléfono", enmascararTelefono(reclamacion.telefono)],
    ["Correo", enmascararEmail(reclamacion.email)],
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
              <dt className="t-label mb-1">Número de hoja</dt>
              <dd className="t-body text-volcan-700">{reclamacion.code}</dd>
            </div>
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
          <p className="t-body mb-10 text-muted">
            Por tu seguridad, el documento, el teléfono y el correo aparecen parcialmente ocultos en esta página. La
            copia completa de la hoja consta en nuestro registro.
          </p>

          <div className="mb-10">
            <p className="t-label mb-2">Detalle</p>
            <p className="t-body whitespace-pre-line text-volcan-700">{reclamacion.detalle}</p>
          </div>

          <div className="mb-12">
            <p className="t-label mb-2">Pedido del consumidor</p>
            <p className="t-body whitespace-pre-line text-volcan-700">{reclamacion.pedido}</p>
          </div>

          <div className="mb-12">
            <p className="t-label mb-2">Observaciones y acciones adoptadas por el proveedor</p>
            {reclamacion.estado === "respondida" && reclamacion.respuesta ? (
              <>
                <p className="t-body whitespace-pre-line text-volcan-700">{reclamacion.respuesta}</p>
                {reclamacion.respondidaEn && (
                  <p className="t-label mt-3">Respuesta comunicada el {formatFecha(reclamacion.respondidaEn)}</p>
                )}
              </>
            ) : (
              <p className="t-body text-volcan-700">
                Pendiente de respuesta. Plazo máximo: {PLAZO_RESPUESTA}.
              </p>
            )}
          </div>

          <div className="mb-12 space-y-4 border-y border-sillar-300 py-8">
            <p className="t-body text-volcan-700">
              La formulación del reclamo no impide acudir a otras vías de solución de controversias ni es requisito
              previo para interponer una denuncia ante el INDECOPI.
            </p>
            <p className="t-body text-volcan-700">
              El proveedor debe dar respuesta al reclamo o queja en un plazo no mayor a {PLAZO_RESPUESTA}, el cual es
              improrrogable.
            </p>
            <p className="t-body text-volcan-700">
              {reclamacion.emailEnviado ? (
                <>Te enviamos una copia de esta hoja por correo electrónico.</>
              ) : (
                <>
                  Guarda este enlace: es tu constancia. Si necesitas una copia, escríbenos a{" "}
                  <a href={`mailto:${SITE.contact.email}`} className="link-line">
                    {SITE.contact.email}
                  </a>{" "}
                  indicando el número de hoja.
                </>
              )}
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
