import type { LegalSection } from "@/content/legal/privacidad";

/** Tipografía de documento para páginas legales (DESIGN.md, max-w-prose-narrow). */
export function Prose({ sections }: { sections: LegalSection[] }) {
  return (
    <div className="max-w-prose-narrow">
      {sections.map((section) => (
        <section
          key={section.id}
          id={section.id}
          className="scroll-mt-[calc(var(--header-h)+24px)] border-b border-sillar-200 pb-10 mb-10 last:mb-0 last:border-b-0 last:pb-0"
        >
          <h2 className="t-h3 mb-4">{section.title}</h2>
          <div className="space-y-4">
            {section.paragraphs.map((paragraph, index) => (
              <p key={index} className="t-body text-volcan-700">
                {paragraph}
              </p>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
