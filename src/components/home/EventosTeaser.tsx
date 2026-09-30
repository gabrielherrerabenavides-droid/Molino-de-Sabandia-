import Link from "next/link";
import { EVENT_TYPES } from "@/content/site";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal, RevealItem } from "@/components/ui/Reveal";
import { RESERVATIONS_ENABLED } from "@/lib/features";

export function EventosTeaser() {
  return (
    <section id="eventos" aria-labelledby="eventos-title" className="sillar-pattern-dark text-sillar-50">
      <div className="container-site">
        <hr className="stone-rule-dark" />
      </div>
      <div className="container-site pt-[clamp(24px,3vw,56px)] pb-[var(--section-y)]">
        <div className="grid items-end gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <Reveal className="max-w-none">
            <Eyebrow tone="light" className="mb-5">
              Eventos y celebraciones
            </Eyebrow>
            <h2 id="eventos-title" className="t-display max-w-[18ch] text-sillar-50">
              Tu celebración entre sillar, agua y campiña.
            </h2>
          </Reveal>
          <Reveal delay={0.1} className="max-w-none">
            <p className="t-lead t-lead-light max-w-prose-narrow">
              Bodas, sesiones de fotos, quinceañeras, visitas de colegio o días de integración. Cuéntanos qué quieres
              celebrar y {RESERVATIONS_ENABLED ? "revisamos la disponibilidad contigo." : "conversemos sobre las posibilidades del lugar."}
            </p>
          </Reveal>
        </div>

        <Reveal stagger={0.07} as="ul" className="mt-[clamp(36px,5vw,72px)] grid gap-0 sm:grid-cols-2 lg:grid-cols-3">
          {EVENT_TYPES.map((type) => (
            <RevealItem as="li" key={type.slug} className="pr-[clamp(0px,2vw,32px)]">
              <hr className="stone-rule-dark" />
              <div className="py-[clamp(18px,2.4vw,32px)]">
                <h3 className="t-h3 text-sillar-50">{type.title}</h3>
                <p className="mt-2 text-[0.95rem] leading-relaxed text-sillar-50/65">{type.short}</p>
              </div>
            </RevealItem>
          ))}
        </Reveal>

        <hr className="stone-rule-dark" />

        <Reveal delay={0.1} className="mt-[clamp(28px,4vw,56px)] flex flex-col gap-3 sm:flex-row">
          {RESERVATIONS_ENABLED ? (
            <Link href="/reservas" className="btn btn-light">Reservar un evento</Link>
          ) : (
            <Link href="/contacto" className="btn btn-light">Consultar por un evento</Link>
          )}
          <Link href="/eventos" className="btn btn-ghost-light">
            Ver espacios
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
