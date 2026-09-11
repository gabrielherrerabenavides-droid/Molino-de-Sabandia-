import { Container } from "@/components/ui/Container";
import { LegalNav, type LegalTocItem } from "@/components/legal/LegalNav";
import { LEGAL_NAV } from "@/content/site";
import { PRIVACIDAD_SECTIONS } from "@/content/legal/privacidad";
import { TERMINOS_SECTIONS } from "@/content/legal/terminos";
import { COOKIES_SECTIONS } from "@/content/legal/cookies";

/** Solo viajan al cliente los títulos del índice; los párrafos se quedan en el servidor. */
const titulos = (sections: { id: string; title: string }[]): LegalTocItem[] =>
  sections.map(({ id, title }) => ({ id, title }));

const TOC_BY_PATH: Record<string, LegalTocItem[]> = {
  "/legal/privacidad": titulos(PRIVACIDAD_SECTIONS),
  "/legal/terminos": titulos(TERMINOS_SECTIONS),
  "/legal/cookies": titulos(COOKIES_SECTIONS),
};

const LEGAL_PAGES = LEGAL_NAV.filter((item) => item.href.startsWith("/legal/"));

/** Layout de lectura para /legal/*: max-w-prose-narrow, tipografía de documento, índice lateral en desktop. */
export default function LegalLayout({ children }: LayoutProps<"/legal">) {
  return (
    <div className="pt-[calc(var(--header-h)+clamp(40px,7vw,96px))] pb-[clamp(64px,10vw,140px)]">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[220px_1fr] lg:gap-16">
          <aside className="hidden lg:block">
            <LegalNav variant="aside" items={LEGAL_PAGES} tocByPath={TOC_BY_PATH} />
          </aside>

          <div>
            <LegalNav variant="inline" items={LEGAL_PAGES} />
            {children}
          </div>
        </div>
      </Container>
    </div>
  );
}
