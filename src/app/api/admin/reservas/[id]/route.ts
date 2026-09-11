/**
 * PATCH /api/admin/reservas/[id] — cambia el estado y/o las notas internas.
 * Ambos campos son opcionales: enviar solo `adminNotes` guarda la nota sin avisar
 * al cliente. Al confirmar o cancelar sí se envía correo (ver lib/reservas/mail),
 * y confirmar puede responder 409 si la franja ya está ocupada.
 */
import { NextResponse } from "next/server";
import { adminAuthResponse, checkAdminAuth } from "@/lib/reservas/auth";
import { fieldErrors, reservaPatchSchema } from "@/lib/reservas/schema";
import { actualizarEstado } from "@/lib/reservas/service";

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

  const parsed = reservaPatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos no válidos.", fields: fieldErrors(parsed.error) },
      { status: 422, headers: NO_STORE },
    );
  }

  const result = await actualizarEstado(id, parsed.data);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status, headers: NO_STORE });
  }
  return NextResponse.json({ ok: true, reserva: result.reserva }, { headers: NO_STORE });
}
