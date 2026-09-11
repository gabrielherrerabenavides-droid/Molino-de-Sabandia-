/**
 * Proxy (antes «middleware», ver docs 16-proxy.md):
 *  - protege la zona de administración con autenticación HTTP Basic y frena la
 *    fuerza bruta contando los intentos fallidos por IP;
 *  - limita las consultas a las constancias de reserva (`/reservas/<token>`),
 *    que son públicas pero contienen datos personales.
 * Si faltan ADMIN_USER o ADMIN_PASSWORD, /admin responde 503 y no expone nada.
 *
 * Aviso operativo: los contadores viven en memoria de la instancia (igual que
 * `src/lib/rate-limit.ts`). En serverless son un freno útil, no una garantía.
 */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_REALM, ADMIN_UNCONFIGURED_MESSAGE, checkAdminAuth } from "@/lib/reservas/auth";
import { clientKey, rateLimit } from "@/lib/rate-limit";

const TEXTO = { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" };

/** Intentos fallidos de Basic Auth tolerados por IP y ventana de bloqueo. */
const AUTH_INTENTOS = 10;
const AUTH_VENTANA_MS = 15 * 60 * 1000;
/** Consultas de constancia por IP y minuto. */
const CONSTANCIA_LIMITE = 20;
const CONSTANCIA_VENTANA_MS = 60 * 1000;

/** IPs bloqueadas por exceso de intentos fallidos: clave → instante de desbloqueo. */
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

  // --- Constancias públicas: /reservas/<token> ------------------------------
  if (pathname.startsWith("/reservas/")) {
    const gate = rateLimit(clientKey(request, "constancia"), CONSTANCIA_LIMITE, CONSTANCIA_VENTANA_MS);
    if (!gate.ok) {
      return demasiadasPeticiones(
        "Demasiadas consultas desde tu conexión. Inténtalo de nuevo en un minuto.",
        60,
      );
    }
    // La página ya es `force-dynamic` (Next responde con `no-store`); esto lo
    // garantiza también para cualquier otra respuesta bajo /reservas/<token>.
    const paso = NextResponse.next();
    paso.headers.set("cache-control", "no-store");
    return paso;
  }

  // --- Zona de administración ----------------------------------------------
  const authKey = clientKey(request, "admin-auth");
  if (bloqueoActivo(authKey)) {
    return demasiadasPeticiones("Demasiados intentos. Espera 15 minutos.", AUTH_VENTANA_MS / 1000);
  }

  const result = await checkAdminAuth(request.headers.get("authorization"));
  if (result === "ok") return NextResponse.next();

  if (result === "unconfigured") {
    return new NextResponse(ADMIN_UNCONFIGURED_MESSAGE, { status: 503, headers: TEXTO });
  }

  // Solo los fallos consumen cupo: navegar autenticado nunca bloquea.
  if (!rateLimit(authKey, AUTH_INTENTOS, AUTH_VENTANA_MS).ok) {
    bloqueados.set(authKey, Date.now() + AUTH_VENTANA_MS);
  }

  return new NextResponse("Autenticación requerida.", {
    status: 401,
    headers: { ...TEXTO, "www-authenticate": ADMIN_REALM },
  });
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/api/admin/:path*", "/reservas/:path+"],
};
