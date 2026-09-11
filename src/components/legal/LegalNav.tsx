"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";

export type LegalNavItem = { href: string; label: string };
export type LegalTocItem = { id: string; title: string };

/**
 * Única isla cliente de /legal: resuelve el enlace activo con `usePathname`.
 * El contenido de los documentos se queda en el servidor (solo viajan los títulos).
 */
export function LegalNav({
  variant,
  items,
  tocByPath,
}: {
  variant: "aside" | "inline";
  items: readonly LegalNavItem[];
  tocByPath?: Record<string, readonly LegalTocItem[]>;
}) {
  const pathname = usePathname() ?? "";

  if (variant === "inline") {
    return (
      <nav aria-label="Documentos legales" className="mb-10 flex flex-wrap gap-x-6 lg:hidden">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            aria-current={pathname === item.href ? "page" : undefined}
            className={clsx("t-label-ocre inline-flex min-h-11 items-center", pathname !== item.href && "!text-muted")}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    );
  }

  const toc = tocByPath?.[pathname] ?? [];

  return (
    <nav aria-label="Documentos legales" className="sticky top-[calc(var(--header-h)+24px)]">
      <p className="t-label mb-4">Legal</p>
      <ul className="mb-10 space-y-3">
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={pathname === item.href ? "page" : undefined}
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
  );
}
