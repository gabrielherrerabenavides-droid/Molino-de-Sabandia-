/**
 * GET /api/reservas/disponibilidad?mes=AAAA-MM
 * Devuelve la disponibilidad de cada día del mes para el calendario del asistente.
 */
import { NextResponse } from "next/server";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { isIsoMonth } from "@/lib/reservas/availability";
import { disponibilidadDelMes, mesActual } from "@/lib/reservas/service";

export async function GET(req: Request) {
  // Cada consulta recorre la colección: sin freno es un amplificador barato.
  if (!rateLimit(clientKey(req, "disponibilidad"), 60, 60_000).ok) {
    return NextResponse.json(
      { error: "Demasiadas consultas. Inténtalo en un minuto." },
      { status: 429, headers: { "cache-control": "no-store", "retry-after": "60" } },
    );
  }

  const mes = new URL(req.url).searchParams.get("mes") ?? mesActual();
  if (!isIsoMonth(mes)) {
    return NextResponse.json(
      { error: "Indica el mes con el formato AAAA-MM." },
      { status: 400, headers: { "cache-control": "no-store" } },
    );
  }
  const data = await disponibilidadDelMes(mes);
  return NextResponse.json(data, { headers: { "cache-control": "no-store" } });
}
