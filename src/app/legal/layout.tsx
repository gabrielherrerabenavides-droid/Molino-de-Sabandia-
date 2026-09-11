"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { Container } from "@/components/ui/Container";
import { LEGAL_NAV } from "@/content/site";
import { PRIVACIDAD_SECTIONS } from "@/content/legal/privacidad";
import { TERMINOS_SECTIONS } from "@/content/legal/terminos";
import { COOKIES_SECTIONS } from "@/content/legal/cookies";

const TOC_BY_PATH: Record<string, { id: string; title: string }[]> = {
  "/legal/privacidad": PRIVACIDAD_SECTIONS,
  "/legal/terminos": TERMINOS_SECTIONS,
  "/legal/cookies": COOKIES_SECTIONS,
};

/** Layout de lectura para /legal/*: max-w-prose-narrow, tipografía de documento, índice lateral en desktop. */
export default function LegalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const toc = TOC_BY_PATH[pathname ?? ""] ?? [];
  const legalPages = LEGAL_NAV.filter((item) => item.href.startsWith("/legal/"));

  return (
    <div className="pt-[calc(var(--header-h)+clamp(40px,7vw,96px))] pb-[clamp(64px,10vw,140px)]">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[220px_1fr] lg:gap-16">
          <aside className="hidden lg:block">
            <nav aria-label="Documentos legales" className="sticky top-[calc(var(--header-h)+24px)]">
              <p className="t-label mb-4">Legal</p>
              <ul className="mb-10 space-y-3">
                {legalPages.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={clsx(
                        "t-body transition-colors",
                        pathname === item.href ? "text-ocre-500" : "text-muted hover:text-volcan-900"
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
              {toc.length > 0 && (
                <>
                  <p className="t-label mb-4">En esta página</p>
                  <ul className="space-y-3 border-l border-sillar-300 pl-4">
                    {toc.map((section) => (
                      <li key={section.id}>
                        <a href={`#${section.id}`} className="t-body text-muted transition-colors hover:text-volcan-900">
                          {section.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </nav>
          </aside>

          <div>
            <nav aria-label="Documentos legales" className="mb-10 flex flex-wrap gap-x-6 lg:hidden">
              {legalPages.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx("t-label-ocre inline-flex min-h-11 items-center", pathname !== item.href && "!text-muted")}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            {children}
          </div>
        </div>
      </Container>
    </div>
  );
}
