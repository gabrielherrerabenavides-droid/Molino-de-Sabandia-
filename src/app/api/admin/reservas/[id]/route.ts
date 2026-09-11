/**
 * PATCH /api/admin/reservas/[id] — cambia el estado y las notas internas.
 * Al confirmar o cancelar se avisa al cliente por correo (ver lib/reservas/mail).
 */
import { NextResponse } from "next/server";
import { adminAuthResponse, checkAdminAuth } from "@/lib/reservas/auth";
import { fieldErrors, reservaPatchSchema } from "@/lib/reservas/schema";
import { actualizarEstado } from "@/lib/reservas/service";

const NO_STORE = { "cache-control": "no-store" };

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = checkAdminAuth(req.headers.get("authorization"));
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
