import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/ui/PageHero";
import { ReservaWizard } from "@/components/reservas/ReservaWizard";
import { SITE } from "@/content/site";
import { pageMetadata } from "@/lib/seo";

const DESCRIPCION =
  "Solicita una fecha para tu boda, sesión fotográfica, quinceañera, evento corporativo o visita en grupo en el Molino de Sabandía. Te confirmamos la disponibilidad en 24 a 48 horas.";

export const metadata: Metadata = pageMetadata({
  title: "Reservas",
  description: DESCRIPCION,
  path: "/reservas",
});

export default function ReservasPage() {
  const email: string = SITE.contact.email;
  const telefono: string = SITE.contact.phone;

  return (
    <>
      <PageHero
        eyebrow="Reservas"
        title="Reserva tu evento en el molino."
        lead="Cuatro pasos: el tipo de evento, la fecha, tus datos y la confirmación. Trabajamos con al menos tres días de antelación y respondemos en 24 a 48 horas."
      />

      <section className="pb-[clamp(72px,10vw,160px)]">
        <div className="container-site">
          <ReservaWizard />

          <hr className="stone-rule mt-[clamp(56px,7vw,96px)]" />

          <div className="grid gap-8 pt-8 sm:grid-cols-3">
            <div>
              <p className="t-label mb-2">Cómo funciona</p>
              <p className="t-body text-muted">
                Envías la solicitud, revisamos la disponibilidad real de la fecha y te escribimos con las condiciones
                y el presupuesto. La reserva queda en firme cuando lo confirmamos por escrito.
              </p>
            </div>
            <div>
              <p className="t-label mb-2">Si prefieres hablar</p>
              <p className="t-body text-muted">
                Escríbenos a{" "}
                <a href={`mailto:${email}`} className="link-line text-ocre-500">
                  {email}
                </a>
                {telefono.length > 0 ? ` o llámanos al ${telefono}.` : "."}
              </p>
            </div>
            <div>
              <p className="t-label mb-2">Tus datos</p>
              <p className="t-body text-muted">
                Solo los usamos para gestionar tu solicitud, conforme a la Ley 29733. Puedes leer la{" "}
                <Link href="/legal/privacidad" className="link-line text-ocre-500">
                  política de privacidad
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
