/**
 * GET /api/admin/reservas — listado de solicitudes (JSON o CSV con ?format=csv).
 * Filtros: ?status=pendiente|confirmada|cancelada y ?mes=AAAA-MM.
 * Protegido por Basic Auth en `src/proxy.ts`; se vuelve a comprobar aquí.
 */
import { NextResponse } from "next/server";
import { adminAuthResponse, checkAdminAuth } from "@/lib/reservas/auth";
import { reservaFiltroSchema } from "@/lib/reservas/schema";
import { listarReservas, reservasToCsv } from "@/lib/reservas/service";

const NO_STORE = { "cache-control": "no-store" };

export async function GET(req: Request) {
  const auth = await checkAdminAuth(req.headers.get("authorization"));
  if (auth !== "ok") return adminAuthResponse(auth);

  const params = new URL(req.url).searchParams;
  const parsed = reservaFiltroSchema.safeParse({
    status: params.get("status") ?? undefined,
    mes: params.get("mes") ?? undefined,
  });
  if (!parsed.success) {
    return NextResponse.json({ error: "Filtros no válidos." }, { status: 400, headers: NO_STORE });
  }

  const reservas = await listarReservas(parsed.data);

  if (params.get("format") === "csv") {
    const sufijo = [parsed.data.mes, parsed.data.status].filter(Boolean).join("-");
    const nombre = `reservas-molino${sufijo ? `-${sufijo}` : ""}.csv`;
    return new NextResponse(reservasToCsv(reservas), {
      headers: {
        ...NO_STORE,
        "content-type": "text/csv; charset=utf-8",
        "content-disposition": `attachment; filename="${nombre}"`,
      },
    });
  }

  return NextResponse.json({ total: reservas.length, reservas }, { headers: NO_STORE });
}
