/**
 * GET /api/reservas/disponibilidad?mes=AAAA-MM
 * Devuelve la disponibilidad de cada día del mes para el calendario del asistente.
 */
import { NextResponse } from "next/server";
import { isIsoMonth } from "@/lib/reservas/availability";
import { disponibilidadDelMes, mesActual } from "@/lib/reservas/service";

export async function GET(req: Request) {
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
