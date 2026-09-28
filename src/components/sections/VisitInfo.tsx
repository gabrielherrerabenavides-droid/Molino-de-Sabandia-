import { Car, Bus, Footprints, Droplets, SunMedium, Milestone, Accessibility } from "lucide-react";
import { SITE } from "@/content/site";
import { Reveal, RevealItem } from "@/components/ui/Reveal";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Button } from "@/components/ui/Button";
import { OpenStatus } from "@/components/ui/OpenStatus";
import { MapEmbed } from "@/components/sections/MapEmbed";
import { Faq } from "@/components/sections/Faq";

const TRAVEL_ICON = { Taxi: Car, Bus: Bus, Auto: Car } as const;

const RECOMENDACIONES = [
  { icon: Footprints, text: "Calzado cómodo: hay escaleras y suelos de piedra irregulares." },
  { icon: Droplets, text: "Lleva agua, sobre todo si visitas al mediodía." },
  { icon: SunMedium, text: "Protector solar: la campiña de Arequipa tiene sol intenso todo el año." },
  { icon: Milestone, text: "El recorrido tiene escaleras y desniveles de piedra." },
  { icon: Accessibility, text: "Accesibilidad bajo consulta: escríbenos antes de tu visita si necesitas una ruta accesible." },
];

const CERCA = [
  { title: "Yumina", text: "A unos 3 km, andenería prehispánica que aún ordena el agua de la campiña." },
  { title: "Characato", text: "Pueblo tradicional de la campiña arequipeña, con su propia plaza e iglesia colonial." },
  { title: "Paucarpata", text: "Distrito vecino, parte del mismo sistema de manantiales que alimenta el molino." },
];

/** Bloque compuesto de /visita: horario, tarifas, cómo llegar, mapa, recomendaciones, cercanías y FAQ. */
export function VisitInfo() {
  return (
    <>
      {/* Horario */}
      <section className="section sillar-pattern border-t border-sillar-200">
        <div className="container-site">
          <Reveal>
            <Eyebrow tone="ocre">Horario</Eyebrow>
            <h2 className="t-h2 mt-3 mb-6 max-w-[16ch]">Cuándo visitarnos</h2>
          </Reveal>
          <Reveal className="flex flex-wrap items-center gap-4">
            <OpenStatus tone="ink" />
            <p className="t-body text-volcan-700">{SITE.hours.note}</p>
          </Reveal>
        </div>
      </section>

      {/* Tarifas */}
      <section className="section border-t border-sillar-200">
        <div className="container-site">
          <Reveal>
            <Eyebrow tone="ocre">Tarifas</Eyebrow>
            <h2 className="t-h2 mt-3 mb-10 max-w-[16ch]">Entradas</h2>
          </Reveal>
          <Reveal as="ul" stagger={0.08} className="grid gap-px border border-sillar-300 bg-sillar-300 sm:grid-cols-2 lg:grid-cols-4">
            {SITE.admission.map((item) => (
              <RevealItem as="li" key={item.label} className="bg-sillar-50 p-6">
                <p className="t-num text-ocre-500">
                  {item.price === null ? "Por confirmar" : item.price === 0 ? "Gratis" : `${SITE.currency} ${item.price}`}
                </p>
                <p className="t-h3 mt-3 mb-1">{item.label}</p>
                <p className="t-body text-muted">{item.detail}</p>
              </RevealItem>
            ))}
          </Reveal>
        </div>
      </section>

      {/* Cómo llegar + mapa */}
      <section className="section sillar-pattern border-t border-sillar-200">
        <div className="container-site grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <Reveal>
              <Eyebrow tone="ocre">Cómo llegar</Eyebrow>
              <h2 className="t-h2 mt-3 mb-6 max-w-[16ch]">A {SITE.distanceKm} km de Arequipa</h2>
              <p className="t-lead max-w-prose-narrow mb-8">
                Sabandía está al sureste del Centro Histórico. Estas son las formas más comunes de llegar.
              </p>
            </Reveal>
            <Reveal as="ul" stagger={0.08} className="space-y-6 mb-10">
              {SITE.travel.map((item) => {
                const Icon = TRAVEL_ICON[item.mode as keyof typeof TRAVEL_ICON] ?? Car;
                return (
                  <RevealItem as="li" key={item.mode} className="flex items-start gap-4">
                    <Icon size={22} className="mt-1 shrink-0 text-agua-500" aria-hidden />
                    <div>
                      <p className="t-h3">{item.mode}</p>
                      <p className="t-body text-volcan-700">
                        {item.detail}
                        {item.cost && <span className="text-muted"> · {item.cost}</span>}
                      </p>
                    </div>
                  </RevealItem>
                );
              })}
            </Reveal>
          </div>
          <Reveal>
            <MapEmbed />
          </Reveal>
        </div>
      </section>

      {/* Recomendaciones */}
      <section className="section border-t border-sillar-200">
        <div className="container-site">
          <Reveal>
            <Eyebrow tone="ocre">Antes de venir</Eyebrow>
            <h2 className="t-h2 mt-3 mb-10 max-w-[18ch]">Recomendaciones</h2>
          </Reveal>
          <Reveal as="ul" stagger={0.08} className="grid gap-8 sm:grid-cols-2 max-w-prose-narrow sm:max-w-none">
            {RECOMENDACIONES.map(({ icon: Icon, text }) => (
              <RevealItem as="li" key={text} className="flex items-start gap-4">
                <Icon size={22} className="mt-1 shrink-0 text-agua-500" aria-hidden />
                <p className="t-body text-volcan-700">{text}</p>
              </RevealItem>
            ))}
          </Reveal>
        </div>
      </section>

      {/* Cerca del molino */}
      <section className="section sillar-pattern border-t border-sillar-200">
        <div className="container-site">
          <Reveal>
            <Eyebrow tone="ocre">Alrededores</Eyebrow>
            <h2 className="t-h2 mt-3 mb-10 max-w-[18ch]">Cerca del molino</h2>
          </Reveal>
          <Reveal as="ul" stagger={0.08} className="grid gap-10 sm:grid-cols-3">
            {CERCA.map((item) => (
              <RevealItem as="li" key={item.title}>
                <p className="t-h3 mb-2">{item.title}</p>
                <p className="t-body text-volcan-700">{item.text}</p>
              </RevealItem>
            ))}
          </Reveal>
        </div>
      </section>

      {/* FAQ */}
      <section className="section border-t border-sillar-200">
        <div className="container-site grid gap-[clamp(28px,4vw,64px)] lg:grid-cols-[0.8fr_1.2fr]">
          <Reveal>
            <Eyebrow tone="ocre">Preguntas frecuentes</Eyebrow>
            <h2 className="t-h2 mt-3 max-w-[14ch]">Antes de que preguntes</h2>
          </Reveal>
          <Faq />
        </div>
      </section>

      {/* CTA grupos */}
      <section className="section border-t border-sillar-200 bg-volcan-950 text-sillar-50">
        <div className="container-site flex flex-col items-start gap-6">
          <Reveal>
            <Eyebrow tone="light">Grupos</Eyebrow>
            <h2 className="t-h2 mt-3 max-w-[18ch]">¿Vienes con un grupo grande?</h2>
            <p className="t-lead max-w-prose-narrow mt-4 !text-sillar-200">
              Colegios, universidades y agencias de viaje pueden reservar visita guiada con anticipación.
            </p>
          </Reveal>
          <Button href="/reservas?tipo=grupo" variant="light">
            Reservar para mi grupo
          </Button>
        </div>
      </section>
    </>
  );
}
