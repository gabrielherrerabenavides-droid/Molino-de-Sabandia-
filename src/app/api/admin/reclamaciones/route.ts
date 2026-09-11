/**
 * GET /api/admin/reclamaciones — listado interno en JSON o CSV (?format=csv).
 * Protegido con la misma Basic Auth que /admin.
 */
import { NextResponse } from "next/server";
import { adminAuthResponse, checkAdminAuth } from "@/lib/reservas/auth";
import { reclamacionFiltroSchema } from "@/lib/reclamaciones/schema";
import { listarReclamaciones, reclamacionesToCsv } from "@/lib/reclamaciones/service";

const NO_STORE = { "cache-control": "no-store" };

export async function GET(req: Request) {
  const auth = await checkAdminAuth(req.headers.get("authorization"));
  if (auth !== "ok") return adminAuthResponse(auth);

  const url = new URL(req.url);
  const parsed = reclamacionFiltroSchema.safeParse({ estado: url.searchParams.get("estado") ?? undefined });
  const lista = await listarReclamaciones(parsed.success ? parsed.data : {});

  if (url.searchParams.get("format") === "csv") {
    const fecha = new Date().toISOString().slice(0, 10);
    return new Response(reclamacionesToCsv(lista), {
      headers: {
        ...NO_STORE,
        "content-type": "text/csv; charset=utf-8",
        "content-disposition": `attachment; filename="reclamaciones-${fecha}.csv"`,
      },
    });
  }

  return NextResponse.json({ ok: true, reclamaciones: lista }, { headers: NO_STORE });
}
