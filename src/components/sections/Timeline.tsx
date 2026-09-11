import { Reveal, RevealItem } from "@/components/ui/Reveal";
import { TIMELINE } from "@/content/site";

/** Línea de tiempo vertical 1621 / 1972 / 1973 / Hoy (DESIGN.md §7). */
export function Timeline() {
  return (
    <Reveal as="ul" stagger={0.1} className="relative max-w-prose-narrow space-y-12 border-l border-sillar-300 pl-8">
      {TIMELINE.map((item) => (
        <RevealItem as="li" key={item.year} className="relative">
          <span aria-hidden className="absolute -left-[33px] top-2 h-2 w-2 bg-ocre-500" />
          <p className="t-num text-ocre-500">{item.year}</p>
          <h3 className="t-h3 mt-1 mb-2">{item.title}</h3>
          <p className="t-body text-volcan-700">{item.text}</p>
        </RevealItem>
      ))}
    </Reveal>
  );
}
