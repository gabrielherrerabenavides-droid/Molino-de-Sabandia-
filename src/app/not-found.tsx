import Link from "next/link";
import { NAV } from "@/content/site";

export default function NotFound() {
  return (
    <div className="section flex min-h-[70vh] flex-col justify-center pt-[calc(var(--header-h)+40px)]">
      <div className="container-site">
        <p className="t-label-ocre mb-4">404</p>
        <h1 className="t-display mb-6 max-w-[20ch]">Esta piedra no está en el molino.</h1>
        <p className="t-lead max-w-prose-narrow mb-10">
          La página que buscas no existe o cambió de lugar. Vuelve al inicio o explora el resto del sitio.
        </p>
        <div className="mb-14">
          <Link href="/" className="btn btn-primary">
            Volver al inicio
          </Link>
        </div>
        <nav aria-label="Mapa del sitio">
          <p className="t-label mb-4">Mapa del sitio</p>
          <ul className="flex flex-wrap gap-x-8 gap-y-2">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="link-line t-body">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}
