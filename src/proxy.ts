/**
 * Proxy (antes «middleware», ver docs 16-proxy.md): protege la zona de
 * administración con autenticación HTTP Basic. Si faltan ADMIN_USER o
 * ADMIN_PASSWORD, responde 503 y no expone nada.
 */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_REALM, ADMIN_UNCONFIGURED_MESSAGE, checkAdminAuth } from "@/lib/reservas/auth";

export function proxy(request: NextRequest) {
  const result = checkAdminAuth(request.headers.get("authorization"));
  if (result === "ok") return NextResponse.next();

  if (result === "unconfigured") {
    return new NextResponse(ADMIN_UNCONFIGURED_MESSAGE, {
      status: 503,
      headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" },
    });
  }

  return new NextResponse("Autenticación requerida.", {
    status: 401,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "no-store",
      "www-authenticate": ADMIN_REALM,
    },
  });
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/api/admin/:path*"],
};
