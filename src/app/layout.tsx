import type { Metadata, Viewport } from "next";
import { Archivo, Playfair_Display } from "next/font/google";
import "./globals.css";
import { SITE } from "@/content/site";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Providers } from "@/components/layout/Providers";
import { SPLASH_SCRIPT } from "@/lib/splash";

const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
});

/**
 * Solo itálica 400: la serif únicamente se usa en `.t-caption` y `.t-serif-i`,
 * y ambas fijan `font-style: italic` (ninguna clase ni utilidad pide la
 * variante recta ni un peso distinto). Pedir "normal" hacía que Next
 * precargara un subset de ~38 kB por página que compite con el preload de la
 * imagen LCP. Si algún día hace falta Playfair recto, se reañade aquí.
 */
const playfair = Playfair_Display({
  subsets: ["latin"],
  style: ["italic"],
  weight: ["400"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.name} — ${SITE.tagline}`, template: `%s · ${SITE.name}` },
  description: SITE.description,
  openGraph: {
    type: "website",
    locale: "es_PE",
    siteName: SITE.name,
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "Fachada de sillar del Molino de Sabandía" }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    images: ["/og.jpg"],
  },
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#f7f5ef",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  // suppressHydrationWarning: SPLASH_SCRIPT añade clases a <html> antes de hidratar.
  return (
    <html lang="es-PE" suppressHydrationWarning className={`${archivo.variable} ${playfair.variable} h-full antialiased`}>
      <body className="grain min-h-full flex flex-col">
        <script dangerouslySetInnerHTML={{ __html: SPLASH_SCRIPT }} />
        <Providers>
          <SiteHeader />
          <main id="contenido" className="flex-1">{children}</main>
          <SiteFooter />
        </Providers>
      </body>
    </html>
  );
}
