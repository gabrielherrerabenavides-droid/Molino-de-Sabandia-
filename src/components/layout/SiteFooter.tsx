import Link from "next/link";
import { LEGAL_NAV, PHOTOS, SITE } from "@/content/site";
import { BackToTop } from "@/components/layout/BackToTop";
import { Year } from "@/components/ui/Year";
import { RESERVATIONS_ENABLED } from "@/lib/features";

type FooterColumn = { title: string; links: readonly { href: string; label: string }[] };

const COLUMNS: readonly FooterColumn[] = [
  {
    title: "Visita",
    links: [
      { href: "/visita", label: "Tu visita" },
      { href: "/galeria", label: "Galería" },
      { href: "/#agua", label: "El mecanismo" },
      { href: "/#visita", label: "Horarios y tarifas" },
    ],
  },
  {
    title: "Historia",
    links: [
      { href: "/historia", label: "Historia del molino" },
      { href: "/#destacados", label: "Destacados" },
      { href: "/#historia", label: "Línea de tiempo" },
    ],
  },
  {
    title: "Eventos",
    links: [
      { href: "/eventos", label: "Espacios y celebraciones" },
      ...(RESERVATIONS_ENABLED ? [{ href: "/reservas", label: "Reservar" }] : []),
      { href: "/contacto", label: "Contacto" },
    ],
  },
  { title: "Legal", links: LEGAL_NAV.map((item) => ({ href: item.href, label: item.label })) },
];

const CREDIT_PHOTOS = ["fachada", "camino", "arboles", "escalera", "contrafuertes", "historica", "panoramica"] as const;

export function SiteFooter() {
  // Los datos de contacto son literales en site.ts; se ensanchan a string para poder omitir los vacíos.
  const contact: { phone: string; email: string; facebook: string; instagram: string } = SITE.contact;

  return (
    <footer className="sillar-pattern-dark relative overflow-hidden text-sillar-50">
      <div className="container-site pt-[clamp(56px,8vw,120px)]">
        <p className="t-caption max-w-[20ch] text-sillar-50/90 sm:max-w-[26ch]">
          Hay lugares que todavía nos enseñan a detenernos.
        </p>

        <div className="mt-[clamp(40px,6vw,88px)] grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-5">
          {COLUMNS.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h2 className="t-label t-label-ocre-300">{column.title}</h2>
              <ul className="mt-5 flex flex-col gap-2.5">
                {column.links.map((link) => (
                  <li key={link.href + link.label}>
                    <Link href={link.href} className="link-line text-[0.95rem] text-sillar-50/75 transition-colors hover:text-sillar-50">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div>
            <h2 className="t-label t-label-ocre-300">Contacto</h2>
            <address className="mt-5 flex flex-col gap-2.5 text-[0.95rem] not-italic text-sillar-50/75">
              <span>
                {SITE.address.street}
                <br />
                {SITE.address.district}, {SITE.address.city}
                <br />
                {SITE.address.country}
              </span>
              <span>
                Todos los días · {SITE.hours.open} – {SITE.hours.close} h
              </span>
              {contact.phone && (
                <a href={`tel:${contact.phone.replace(/\s/g, "")}`} className="link-line hover:text-sillar-50">
                  {contact.phone}
                </a>
              )}
              {contact.email && (
                <a href={`mailto:${contact.email}`} className="link-line break-words hover:text-sillar-50">
                  {contact.email}
                </a>
              )}
              {contact.facebook && (
                <a
                  href={contact.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-line hover:text-sillar-50"
                >
                  Facebook
                </a>
              )}
              {contact.instagram && (
                <a
                  href={contact.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-line hover:text-sillar-50"
                >
                  Instagram
                </a>
              )}
            </address>
          </div>
        </div>

        <hr className="stone-rule-dark mt-[clamp(40px,6vw,88px)]" />

        <div className="flex flex-col gap-6 py-7 md:flex-row md:items-start md:justify-between">
          <p className="max-w-[70ch] text-[0.78rem] leading-relaxed text-sillar-50/45">
            Fotografías: Wikimedia Commons —{" "}
            {CREDIT_PHOTOS.map((key, index) => {
              const photo = PHOTOS[key];
              return (
                <span key={key}>
                  <a
                    href={photo.source}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-line hover:text-sillar-50/80"
                  >
                    {photo.author} ({photo.license})
                  </a>
                  {index < CREDIT_PHOTOS.length - 1 ? " · " : "."}
                </span>
              );
            })}
          </p>
          <BackToTop className="inline-flex min-h-11 shrink-0 items-center gap-2 self-start text-[0.78rem] tracking-[0.12em] text-sillar-50/60 uppercase transition-colors hover:text-sillar-50" />
        </div>
      </div>

      <div aria-hidden="true" className="container-site overflow-hidden pt-[clamp(16px,3vw,40px)]">
        <p className="footer-wordmark -mb-[0.18em] translate-y-[0.12em]">Molino de Sabandía</p>
      </div>

      <div className="container-site flex flex-col gap-2 border-t border-sillar-50/10 py-6 text-[0.78rem] text-sillar-50/50 sm:flex-row sm:items-center sm:justify-between">
        <p>
          © <Year /> {SITE.name}. Todos los derechos reservados.
        </p>
        <p>Hecho en Arequipa.</p>
      </div>
    </footer>
  );
}
