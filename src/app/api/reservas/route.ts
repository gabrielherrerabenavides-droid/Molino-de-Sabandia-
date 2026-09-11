/**
 * POST /api/reservas — crea una solicitud de reserva desde el asistente público.
 * Límite: 5 solicitudes por IP cada 10 minutos. Trampa antispam en el campo `website`.
 */
import { NextResponse } from "next/server";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { crearReserva, requestMeta } from "@/lib/reservas/service";

const NO_STORE = { "cache-control": "no-store" };

export async function POST(req: Request) {
  const gate = rateLimit(clientKey(req, "reservas"), 5, 10 * 60 * 1000);
  if (!gate.ok) {
    return NextResponse.json(
      { error: "Recibimos varias solicitudes desde tu conexión. Inténtalo de nuevo en unos minutos o escríbenos por correo." },
      { status: 429, headers: { ...NO_STORE, "retry-after": "600" } },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "No pudimos leer la solicitud." }, { status: 400, headers: NO_STORE });
  }

  const result = await crearReserva(body, requestMeta(req));
  if (!result.ok) {
    return NextResponse.json(
      { error: result.error, ...(result.fields ? { fields: result.fields } : {}) },
      { status: result.status, headers: NO_STORE },
    );
  }

  // El código es la referencia visible; el token es lo único que abre la constancia.
  return NextResponse.json(
    { ok: true, code: result.reserva.code, url: `/reservas/${result.reserva.token}` },
    { status: 201, headers: NO_STORE },
  );
}
