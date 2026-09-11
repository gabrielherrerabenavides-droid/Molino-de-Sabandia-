import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/content/site";

export const metadata: Metadata = {
  title: { default: "Administración", template: "%s · Administración" },
  robots: { index: false, follow: false, nocache: true },
};

/** Zona de administración: sobria, sin animaciones y fuera de los buscadores. */
export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="min-h-screen bg-sillar-50">
      <div className="container-site pt-[calc(var(--header-h)+32px)]">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
          <p className="t-label">{SITE.name} · Administración</p>
          <nav aria-label="Administración">
            <Link href="/admin/reservas" className="link-line t-label text-volcan-900">
              Reservas
            </Link>
          </nav>
        </div>
        <hr className="stone-rule mt-4" />
      </div>
      {children}
    </div>
  );
}
