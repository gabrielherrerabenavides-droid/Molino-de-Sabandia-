import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { SITE } from "@/content/site";
import { EstadoReserva } from "@/components/reservas/EstadoReserva";
import { ResumenReserva } from "@/components/reservas/ResumenReserva";
import { fechaLarga, franjaLabel } from "@/lib/reservas/format";
import { eventTypeTitle } from "@/lib/reservas/schema";
import { reservaPorToken } from "@/lib/reservas/service";
import { pageMetadata } from "@/lib/seo";

/** Contiene datos personales: nunca en caché ni en buscadores. */
export const dynamic = "force-dynamic";

/**
 * El título y el canonical NO incluyen el token (es el secreto del enlace) ni el
 * código; `referrer: no-referrer` evita que el token viaje al salir de la página.
 */
export const metadata: Metadata = {
  ...pageMetadata({
    title: "Estado de tu solicitud",
    description: "Estado de tu solicitud de reserva en el Molino de Sabandía.",
    path: "/reservas",
    noindex: true,
  }),
  referrer: "no-referrer",
};

/** Next entrega el segmento ya decodificado; un `%` suelto haría fallar la segunda pasada. */
function decodificar(valor: string): string {
  try {
    return decodeURIComponent(valor);
  } catch {
    return valor;
  }
}

const SIGUIENTES: Record<string, string> = {
  pendiente:
    "Te escribiremos en 24–48 h para confirmar disponibilidad y condiciones. Si la fecha estuviera ocupada, te propondremos alternativas.",
  confirmada:
    "Tu fecha está reservada. Te enviamos por correo las condiciones y los detalles de la coordinación. Cualquier cambio, escríbenos.",
  cancelada:
    "Esta solicitud quedó cancelada. Si quieres proponer otra fecha, escríbenos y la revisamos contigo.",
};

export default async function ReservaTokenPage(props: PageProps<"/reservas/[token]">) {
  const { token } = await props.params;
  const reserva = await reservaPorToken(decodificar(token));
  if (!reserva) notFound();

  const whatsapp: string = SITE.contact.whatsapp;
  const email: string = SITE.contact.email;
  const telefono: string = SITE.contact.phone;
  const mensajeWhatsapp = `Hola, escribo por mi solicitud de reserva ${reserva.code} para el ${reserva.date}.`;

  const filas = [
    { label: "Tipo de evento", value: eventTypeTitle(reserva.eventType) },
    { label: "Fecha", value: fechaLarga(reserva.date) },
    { label: "Franja", value: franjaLabel(reserva.slot) },
    { label: "Personas", value: String(reserva.guests) },
    { label: "A nombre de", value: reserva.name },
    { label: "Correo", value: reserva.email },
    { label: "Teléfono", value: reserva.phone },
    ...(reserva.message ? [{ label: "Tu mensaje", value: reserva.message }] : []),
  ];

  return (
    <article className="pt-[calc(var(--header-h)+clamp(40px,8vw,120px))]">
      <div className="container-site pb-[clamp(72px,10vw,160px)]">
        <p className="t-label-ocre">Reservas</p>
        <h1 className="t-display mt-5 max-w-[16ch]">
          {reserva.status === "cancelada" ? "Solicitud cancelada" : "Solicitud recibida"}
        </h1>

        <div className="mt-[clamp(40px,6vw,72px)] grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16">
          <div>
            <p className="t-label mb-3">Tu código</p>
            <p className="t-num text-volcan-950">{reserva.code}</p>
            <div className="mt-6">
              <EstadoReserva status={reserva.status} />
            </div>

            <hr className="stone-rule my-8" />

            <p className="t-label mb-3">Siguientes pasos</p>
            <p className="t-body max-w-prose-narrow text-muted">{SIGUIENTES[reserva.status]}</p>

            <div className="mt-8 flex flex-wrap gap-3">
              {whatsapp.length > 0 && (
                <a
                  className="btn btn-primary"
                  href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(mensajeWhatsapp)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle aria-hidden className="size-4" />
                  Escribir por WhatsApp
                </a>
              )}
              <a className="btn btn-ghost" href={`mailto:${email}?subject=${encodeURIComponent(`Reserva ${reserva.code}`)}`}>
                Escribir por correo
              </a>
            </div>

            {telefono.length > 0 && <p className="t-body mt-5 text-muted">También puedes llamarnos al {telefono}.</p>}

            <p className="mt-10">
              <Link href="/" className="link-line inline-flex items-center gap-2 t-label text-volcan-900">
                <ArrowLeft aria-hidden className="size-4" />
                Volver al inicio
              </Link>
            </p>
          </div>

          <div>
            <p className="t-label mb-1">Resumen de tu solicitud</p>
            <ResumenReserva filas={filas} />
            <p className="mt-6 text-[0.85rem] leading-relaxed text-muted">
              Guarda este enlace: es privado y personal, no lo compartas. El código {reserva.code} nos sirve
              para encontrar tu solicitud si nos escribes. Esta página no aparece en buscadores.
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}
