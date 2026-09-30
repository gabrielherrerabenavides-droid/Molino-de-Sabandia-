"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { RESERVATIONS_ENABLED } from "@/lib/features";

const ENLACES = [
  ...(RESERVATIONS_ENABLED ? [{ href: "/admin/reservas", label: "Reservas" }] : []),
  { href: "/admin/reclamaciones", label: "Reclamaciones" },
] as const;

/** Navegación entre las dos bandejas de administración. El apartado activo va en ocre. */
export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Administración">
      <ul className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
        {ENLACES.map((enlace) => {
          const activo = pathname === enlace.href || pathname.startsWith(`${enlace.href}/`);
          return (
            <li key={enlace.href}>
              <Link
                href={enlace.href}
                aria-current={activo ? "page" : undefined}
                className={clsx("link-line t-label", activo ? "text-ocre-500" : "text-volcan-900")}
              >
                {enlace.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
