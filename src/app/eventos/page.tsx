import type { Metadata } from "next";
import Image from "next/image";
import { PageHero } from "@/components/ui/PageHero";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Button } from "@/components/ui/Button";
import { Reveal, RevealItem } from "@/components/ui/Reveal";
import { SITE, PHOTOS, EVENT_TYPES, SLOT_LABELS } from "@/content/site";

const DESCRIPTION =
  "Bodas, quinceañeros, sesiones fotográficas y eventos corporativos en los jardines, el patio de sillar y la campiña del Molino de Sabandía.";

export const metadata: Metadata = {
  title: "Eventos",
  description: DESCRIPTION,
  alternates: { canonical: "/eventos" },
  openGraph: {
    title: `Eventos · ${SITE.name}`,
    description: DESCRIPTION,
    images: [
      { url: PHOTOS.fachada.src, width: PHOTOS.fachada.width, height: PHOTOS.fachada.height, alt: PHOTOS.fachada.alt },
    ],
  },
};

const ESPACIOS = [
  {
    title: "Jardines",
    text: "Ceremonias al aire libre entre árboles y jardines, con el molino de sillar como telón de fondo. Capacidad orientativa de hasta 400 personas, sujeto a confirmación.",
    photo: PHOTOS.fachada,
  },
  {
    title: "Patio de sillar",
    text: "El patio interior, tallado en piedra volcánica, recibe recepciones y celebraciones más íntimas. Capacidad orientativa de hasta 120 personas, sujeto a confirmación.",
    photo: PHOTOS.patio,
  },
  {
    title: "Casona",
    text: "Espacio bajo techo dentro del conjunto histórico, útil para reuniones o momentos del programa que requieren resguardo. Capacidad orientativa de hasta 60 personas, sujeto a confirmación.",
    photo: PHOTOS.escalera,
  },
  {
    title: "Campiña y acequias",
    text: "El paisaje que rodea el molino —acequias, andenes y la vista del Misti— como escenario para fotografías y momentos al aire libre.",
    photo: PHOTOS.panoramica,
  },
] as const;

const PASOS = [
  { title: "Solicita", text: "Cuéntanos qué celebras, cuándo y cuántos invitados esperas a través del formulario de reservas." },
  { title: "Te confirmamos en 24–48 h", text: "Revisamos disponibilidad y te escribimos con las condiciones para tu fecha." },
  { title: "Visita y cierra detalles", text: "Conoces el espacio en persona y afinamos los últimos detalles de tu celebración." },
] as const;

export default function EventosPage() {
  return (
    <>
      <PageHero
        eyebrow="Eventos"
        title="Tu celebración entre sillar, agua y campiña."
        lead={DESCRIPTION}
        image={PHOTOS.fachada}
      />

      {/* Espacios */}
      <section className="section pt-[clamp(56px,8vw,120px)]">
        <Container>
          <Reveal>
            <Eyebrow tone="ocre">Espacios</Eyebrow>
            <h2 className="t-h2 mt-3 mb-10 max-w-[18ch]">Cuatro escenarios, un solo lugar</h2>
          </Reveal>
          <Reveal as="ul" stagger={0.08} className="grid gap-10 sm:grid-cols-2">
            {ESPACIOS.map((espacio) => (
              <RevealItem as="li" key={espacio.title}>
                <figure className="relative aspect-[4/3] w-full overflow-hidden bg-sillar-200">
                  <Image
                    src={espacio.photo.src}
                    alt={espacio.photo.alt}
                    fill
                    sizes="(min-width: 640px) 50vw, 100vw"
                    className="object-cover"
                  />
                </figure>
                <h3 className="t-h3 mt-5 mb-2">{espacio.title}</h3>
                <p className="t-body text-volcan-700">{espacio.text}</p>
              </RevealItem>
            ))}
          </Reveal>
        </Container>
      </section>

      {/* Tipos de evento */}
      <section className="section sillar-pattern border-t border-sillar-200">
        <Container>
          <Reveal>
            <Eyebrow tone="ocre">Qué puedes celebrar</Eyebrow>
            <h2 className="t-h2 mt-3 mb-10 max-w-[20ch]">Elige el tipo de celebración</h2>
          </Reveal>
          <Reveal as="ul" stagger={0.08} className="grid gap-px border border-sillar-300 bg-sillar-300 sm:grid-cols-2 lg:grid-cols-3">
            {EVENT_TYPES.map((event) => (
              <RevealItem as="li" key={event.slug} className="flex flex-col justify-between bg-sillar-50 p-6">
                <div>
                  <h3 className="t-h3 mb-2">{event.title}</h3>
                  <p className="t-body mb-4 text-volcan-700">{event.text}</p>
                  <p className="t-label mb-6">
                    {event.minGuests}–{event.maxGuests} invitados · {event.slots.map((slot) => SLOT_LABELS[slot]).join(" · ")}
                  </p>
                </div>
                <Button href={`/reservas?tipo=${event.slug}`} variant="ghost" className="self-start">
                  Reservar
                </Button>
              </RevealItem>
            ))}
          </Reveal>
        </Container>
      </section>

      {/* Cómo funciona */}
      <section className="section">
        <Container>
          <Reveal>
            <Eyebrow tone="ocre">Cómo funciona</Eyebrow>
            <h2 className="t-h2 mt-3 mb-10 max-w-[18ch]">De la solicitud a tu celebración</h2>
          </Reveal>
          <Reveal as="ul" stagger={0.08} className="grid gap-10 sm:grid-cols-3">
            {PASOS.map((paso, index) => (
              <RevealItem as="li" key={paso.title} className="border-t border-sillar-300 pt-6">
                <p className="t-num text-ocre-500 !text-2xl">{String(index + 1).padStart(2, "0")}</p>
                <h3 className="t-h3 mt-3 mb-2">{paso.title}</h3>
                <p className="t-body text-volcan-700">{paso.text}</p>
              </RevealItem>
            ))}
          </Reveal>
        </Container>
      </section>

      {/* Cita */}
      <section className="section border-t border-sillar-200 bg-volcan-950 text-sillar-50">
        <Container>
          <Reveal>
            <p className="t-caption max-w-[24ch]">&ldquo;Hay lugares que todavía nos enseñan a detenernos.&rdquo;</p>
          </Reveal>
        </Container>
      </section>

      {/* CTA final */}
      <section className="section">
        <Container className="flex flex-col items-start gap-6">
          <Reveal>
            <Eyebrow tone="ocre">Empecemos</Eyebrow>
            <h2 className="t-h2 mt-3 max-w-[18ch]">Cuéntanos qué quieres celebrar</h2>
          </Reveal>
          <Button href="/reservas">Solicitar mi reserva</Button>
        </Container>
      </section>
    </>
  );
}
