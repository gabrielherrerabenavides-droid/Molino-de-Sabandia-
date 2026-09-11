import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { ContactForm } from "@/components/sections/ContactForm";
import { MapEmbed } from "@/components/sections/MapEmbed";
import { SITE } from "@/content/site";

const DESCRIPTION = "Escríbenos para consultas sobre tu visita, eventos, el restaurante o prensa. Te respondemos por correo.";

export const metadata: Metadata = {
  title: "Contacto",
  description: DESCRIPTION,
  alternates: { canonical: "/contacto" },
  openGraph: {
    title: `Contacto · ${SITE.name}`,
    description: DESCRIPTION,
  },
};

export default function ContactoPage() {
  return (
    <>
      <PageHero eyebrow="Contacto" title="Hablemos." lead={DESCRIPTION} />

      <section className="section pt-[clamp(40px,6vw,88px)]">
        <Container>
          <div className="grid gap-16 lg:grid-cols-2 lg:gap-24">
            <Reveal>
              <h2 className="t-h3 mb-6">Datos de contacto</h2>
              <dl className="max-w-prose-narrow space-y-6">
                <div>
                  <dt className="t-label mb-1">Dirección</dt>
                  <dd className="t-body text-volcan-700">{SITE.address.full}</dd>
                </div>
                <div>
                  <dt className="t-label mb-1">Correo</dt>
                  <dd className="t-body">
                    <a href={`mailto:${SITE.contact.email}`} className="link-line">
                      {SITE.contact.email}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="t-label mb-1">Facebook</dt>
                  <dd className="t-body">
                    <a href={SITE.contact.facebook} target="_blank" rel="noopener noreferrer" className="link-line">
                      {SITE.contact.facebook.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="t-label mb-1">Horario</dt>
                  <dd className="t-body text-volcan-700">
                    Todos los días, {SITE.hours.open} – {SITE.hours.close} h
                  </dd>
                </div>
              </dl>
              <div className="mt-10">
                <MapEmbed title="Mapa de ubicación del Molino de Sabandía" />
              </div>
            </Reveal>

            <Reveal>
              <h2 className="t-h3 mb-6">Envíanos un mensaje</h2>
              <ContactForm />
            </Reveal>
          </div>
        </Container>
      </section>
    </>
  );
}
