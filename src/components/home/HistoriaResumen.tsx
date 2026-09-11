import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { TIMELINE } from "@/content/site";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal, RevealItem } from "@/components/ui/Reveal";

export function HistoriaResumen() {
  return (
    <section id="historia" aria-labelledby="historia-title" className="section container-site">
      <Reveal>
        <Eyebrow tone="ocre" className="mb-5">
          Cuatro siglos
        </Eyebrow>
        <h2 id="historia-title" className="t-display max-w-[16ch]">
          Una historia por descubrir.
        </h2>
      </Reveal>

      <Reveal stagger={0.1} as="ul" className="mt-[clamp(36px,5vw,80px)] grid gap-0 md:grid-cols-4">
        {TIMELINE.map((entry, index) => (
          <RevealItem
            as="li"
            key={entry.year}
            className={[
              "relative pb-8 md:pb-0",
              index > 0 ? "border-l border-sillar-300 pl-6 md:border-l md:pl-[clamp(16px,2vw,32px)]" : "border-l border-sillar-300 pl-6 md:border-l-0 md:pl-0",
              "md:pr-[clamp(16px,2vw,32px)]",
            ].join(" ")}
          >
            <span
              aria-hidden="true"
              className="absolute top-2 -left-[4.5px] size-2 rounded-full bg-ocre-500 md:top-auto md:-bottom-0 md:left-0 md:hidden"
            />
            <p className="t-num t-num-sm text-volcan-900">{entry.year}</p>
            <hr className="stone-rule mt-5 hidden md:block" />
            <h3 className="t-h3 mt-5">{entry.title}</h3>
            <p className="t-body max-w-prose-narrow mt-3 text-volcan-700">{entry.text}</p>
          </RevealItem>
        ))}
      </Reveal>

      <Reveal delay={0.1} className="mt-[clamp(28px,4vw,56px)]">
        <Link href="/historia" className="group inline-flex items-center gap-3">
          <span className="link-line t-h3">Leer la historia completa</span>
          <ArrowRight aria-hidden="true" size={20} strokeWidth={1.4} className="arrow-slide-x" />
        </Link>
      </Reveal>
    </section>
  );
}
