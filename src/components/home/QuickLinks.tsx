import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Reveal, RevealItem } from "@/components/ui/Reveal";

const LINKS = [
  { num: "01", label: "Conoce su historia", href: "/historia", hint: "1621 · Patrimonio Cultural" },
  { num: "02", label: "Sigue el agua", href: "#agua", hint: "El mecanismo hidráulico" },
  { num: "03", label: "Prepara tu visita", href: "/visita", hint: "Horarios, tarifas y ruta" },
] as const;

export function QuickLinks() {
  return (
    <nav aria-label="Accesos rápidos" className="container-site pt-[clamp(36px,6vw,72px)]">
      <hr className="stone-rule" />
      <Reveal stagger={0.08} as="ul" className="grid grid-cols-1 md:grid-cols-3">
        {LINKS.map((link, index) => (
          <RevealItem
            as="li"
            key={link.num}
            className={index > 0 ? "border-t border-sillar-200 md:border-t-0 md:border-l md:pl-[clamp(20px,3vw,44px)]" : ""}
          >
            <Link
              href={link.href}
              className="group flex items-start justify-between gap-6 py-[clamp(22px,3vw,38px)] pr-1 transition-colors duration-300 hover:text-ocre-500 md:pr-[clamp(20px,3vw,44px)]"
            >
              <span>
                <span className="t-label-ocre block">{link.num}</span>
                <span className="t-h3 link-line mt-3 block">{link.label}</span>
                <span className="t-label mt-2 block">{link.hint}</span>
              </span>
              <ArrowUpRight aria-hidden="true" size={22} strokeWidth={1.3} className="arrow-slide mt-1 shrink-0" />
            </Link>
          </RevealItem>
        ))}
      </Reveal>
      <hr className="stone-rule" />
    </nav>
  );
}
