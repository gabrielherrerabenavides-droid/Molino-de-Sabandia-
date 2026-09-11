/**
 * PATCH /api/admin/reclamaciones/[id] — registra las observaciones y acciones
 * adoptadas por el proveedor (sección 4 de la Hoja de Reclamación) y avisa al
 * consumidor por correo. Protegido con la misma Basic Auth que /admin.
 */
import { NextResponse } from "next/server";
import { adminAuthResponse, checkAdminAuth } from "@/lib/reservas/auth";
import { camposConError, respuestaReclamacionSchema } from "@/lib/reclamaciones/schema";
import { responderReclamacion } from "@/lib/reclamaciones/service";

const NO_STORE = { "cache-control": "no-store" };

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = await checkAdminAuth(req.headers.get("authorization"));
  if (auth !== "ok") return adminAuthResponse(auth);

  const { id } = await ctx.params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "No pudimos leer la solicitud." }, { status: 400, headers: NO_STORE });
  }

  const parsed = respuestaReclamacionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos no válidos.", fields: camposConError(parsed.error) },
      { status: 422, headers: NO_STORE }
    );
  }

  const result = await responderReclamacion(id, parsed.data);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status, headers: NO_STORE });
  }
  return NextResponse.json({ ok: true, reclamacion: result.reclamacion }, { headers: NO_STORE });
}
