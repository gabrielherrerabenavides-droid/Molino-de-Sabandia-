import Link from "next/link";
import { PageHero } from "@/components/ui/PageHero";
import { Container } from "@/components/ui/Container";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Reservas online en pausa",
  description: "Las reservas online del Molino de Sabandía están temporalmente desactivadas.",
  path: "/reservas-pausadas",
  noindex: true,
});

export default function ReservasPausadasPage() {
  return (
    <>
      <PageHero eyebrow="Información" title="Reservas online en pausa." lead="Por ahora no estamos recibiendo solicitudes de reserva desde la web." />
      <section className="section pt-[clamp(40px,6vw,88px)]">
        <Container className="flex flex-col items-start gap-7">
          <p className="t-body max-w-prose-narrow text-volcan-700">
            Si tienes una consulta sobre eventos o visitas en grupo, escríbenos y el equipo del molino te orientará.
          </p>
          <Link href="/contacto" className="btn btn-primary">Ir a contacto</Link>
        </Container>
      </section>
    </>
  );
}
