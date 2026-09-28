import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SITE } from "@/content/site";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";
import { OpenStatus } from "@/components/ui/OpenStatus";
import { MapEmbed } from "@/components/sections/MapEmbed";

function priceLabel(price: number | null) {
  return price === null ? "Por confirmar" : price === 0 ? "Gratis" : `${SITE.currency} ${price}`;
}

export function Visita() {
  return (
    <section id="visita" aria-labelledby="visita-title" className="section container-site">
      <div className="grid gap-[clamp(32px,5vw,88px)] lg:grid-cols-2">
        <div>
          <Reveal>
            <Eyebrow tone="ocre" className="mb-5">
              Tu visita
            </Eyebrow>
            <h2 id="visita-title" className="t-display max-w-[16ch]">
              Todo listo para venir.
            </h2>
            <div className="mt-7">
              <OpenStatus tone="ink" />
            </div>
          </Reveal>

          <Reveal delay={0.08} className="mt-[clamp(28px,4vw,52px)]">
            <hr className="stone-rule" />
            <div className="grid gap-8 py-7 sm:grid-cols-2">
              <div>
                <h3 className="t-label">Horario</h3>
                <p className="t-h3 mt-3">
                  {SITE.hours.open} – {SITE.hours.close} h
                </p>
                <p className="t-body mt-2 text-volcan-700">{SITE.hours.note}</p>
              </div>
              <div>
                <h3 className="t-label">Tarifas</h3>
                <ul className="mt-3 flex flex-col gap-2">
                  {SITE.admission.map((item) => (
                    <li key={item.label} className="flex items-baseline justify-between gap-4 border-b border-sillar-200 pb-2">
                      <span className="t-body">{item.label}</span>
                      <span className="t-body shrink-0 font-medium">{priceLabel(item.price)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <hr className="stone-rule" />
          </Reveal>

          <Reveal delay={0.12} className="pt-7">
            <h3 className="t-label">Cómo llegar</h3>
            <p className="t-body mt-3 text-volcan-700">
              {SITE.address.full} · a {SITE.distanceKm} km del Centro Histórico.
            </p>
            <ul className="mt-5 flex flex-col gap-3">
              {SITE.travel.map((option) => (
                <li key={option.mode} className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="t-label-ocre w-16 shrink-0">{option.mode}</span>
                  <span className="t-body text-volcan-700">{option.detail}</span>
                  {option.cost && <span className="t-label">{option.cost}</span>}
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/visita" className="btn btn-primary">
                Planifica tu visita
              </Link>
              <a href={SITE.mapsUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
                Cómo llegar · Google Maps
                <ArrowUpRight aria-hidden="true" size={16} strokeWidth={1.5} />
              </a>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.1} className="flex h-full flex-col">
          <div className="w-full overflow-hidden border border-sillar-300 bg-sillar-100 lg:min-h-[420px] lg:flex-1 [&>div]:h-full">
            {/* El mapa solo se carga si el visitante lo pide: sin clic no hay petición a Google. */}
            <MapEmbed />
          </div>
          <p className="t-label mt-4">Sabandía, Arequipa · {SITE.address.postalCode}</p>
        </Reveal>
      </div>
    </section>
  );
}
