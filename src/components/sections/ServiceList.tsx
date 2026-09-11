import { Reveal, RevealItem } from "@/components/ui/Reveal";
import { SERVICES } from "@/content/site";

/** Lista numerada de SERVICES (molienda, restaurante, eventos, campiña). */
export function ServiceList() {
  return (
    <Reveal as="ul" stagger={0.08} className="grid gap-8 border-t border-sillar-300 pt-8 sm:grid-cols-2 lg:grid-cols-4">
      {SERVICES.map((service, index) => (
        <RevealItem as="li" key={service.slug}>
          <p className="t-num !text-2xl text-ocre-500">{String(index + 1).padStart(2, "0")}</p>
          <h3 className="t-h3 mt-3 mb-2">{service.title}</h3>
          <p className="t-body text-volcan-700">{service.text}</p>
        </RevealItem>
      ))}
    </Reveal>
  );
}
