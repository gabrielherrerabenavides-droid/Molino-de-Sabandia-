/**
 * Control de acceso a administración, límite de consultas de constancias y
 * pausa temporal del sistema de reservas.
 */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_REALM, ADMIN_UNCONFIGURED_MESSAGE, checkAdminAuth } from "@/lib/reservas/auth";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { RESERVATIONS_ENABLED } from "@/lib/features";

const TEXTO = { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" };
const AUTH_INTENTOS = 10;
const AUTH_VENTANA_MS = 15 * 60 * 1000;
const CONSTANCIA_LIMITE = 20;
const CONSTANCIA_VENTANA_MS = 60 * 1000;
const bloqueados = new Map<string, number>();

function bloqueoActivo(key: string): boolean {
  const hasta = bloqueados.get(key);
  if (hasta === undefined) return false;
  if (hasta <= Date.now()) {
    bloqueados.delete(key);
    return false;
  }
  return true;
}

function demasiadasPeticiones(mensaje: string, retryAfter: number) {
  return new NextResponse(mensaje, {
    status: 429,
    headers: { ...TEXTO, "retry-after": String(retryAfter) },
  });
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const reservaPublica = pathname === "/reservas" || pathname.startsWith("/reservas/");
  const apiReservas = pathname === "/api/reservas" || pathname.startsWith("/api/reservas/");
  const adminReservas = pathname === "/admin/reservas" || pathname.startsWith("/admin/reservas/");
  const apiAdminReservas = pathname === "/api/admin/reservas" || pathname.startsWith("/api/admin/reservas/");

  if (!RESERVATIONS_ENABLED) {
    if (reservaPublica) return NextResponse.redirect(new URL("/reservas-pausadas", request.url));
    if (apiReservas || apiAdminReservas) {
      return NextResponse.json(
        { error: "Las reservas online están temporalmente desactivadas." },
        { status: 503, headers: { "cache-control": "no-store" } },
      );
    }
    if (adminReservas) return new NextResponse(null, { status: 404, headers: TEXTO });
  }

  if (apiReservas || pathname === "/reservas") return NextResponse.next();

  // Constancias públicas: conservan su límite cuando se reactivan las reservas.
  if (pathname.startsWith("/reservas/")) {
    const gate = rateLimit(clientKey(request, "constancia"), CONSTANCIA_LIMITE, CONSTANCIA_VENTANA_MS);
    if (!gate.ok) {
      return demasiadasPeticiones("Demasiadas consultas desde tu conexión. Inténtalo de nuevo en un minuto.", 60);
    }
    const paso = NextResponse.next();
    paso.headers.set("cache-control", "no-store");
    return paso;
  }

  // Todas las demás rutas de /admin y /api/admin siguen protegidas.
  const authKey = clientKey(request, "admin-auth");
  if (bloqueoActivo(authKey)) {
    return demasiadasPeticiones("Demasiados intentos. Espera 15 minutos.", AUTH_VENTANA_MS / 1000);
  }

  const result = await checkAdminAuth(request.headers.get("authorization"));
  if (result === "ok") return NextResponse.next();
  if (result === "unconfigured") {
    return new NextResponse(ADMIN_UNCONFIGURED_MESSAGE, { status: 503, headers: TEXTO });
  }
  if (!rateLimit(authKey, AUTH_INTENTOS, AUTH_VENTANA_MS).ok) {
    bloqueados.set(authKey, Date.now() + AUTH_VENTANA_MS);
  }
  return new NextResponse("Autenticación requerida.", {
    status: 401,
    headers: { ...TEXTO, "www-authenticate": ADMIN_REALM },
  });
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/api/admin/:path*", "/reservas/:path*", "/api/reservas/:path*"],
};
