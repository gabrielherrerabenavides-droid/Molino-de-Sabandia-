import { NextResponse } from "next/server";
import { reclamacionSchema } from "@/lib/reclamaciones/schema";
import { crearReclamacion } from "@/lib/reclamaciones/service";
import { rateLimit, clientKey } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const { ok: withinLimit } = rateLimit(clientKey(request, "reclamaciones"));
  if (!withinLimit) {
    return NextResponse.json(
      { ok: false, error: "Demasiadas solicitudes. Intenta de nuevo en unos minutos." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Solicitud inválida." }, { status: 400 });
  }

  // Trampa antispam: descarte silencioso, misma respuesta que un envío correcto.
  if (typeof body === "object" && body !== null && String((body as Record<string, unknown>).honeypot ?? "") !== "") {
    return NextResponse.json({ ok: true });
  }

  const parsed = reclamacionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? "Revisa los datos del formulario." },
      { status: 400 }
    );
  }

  try {
    const reclamacion = await crearReclamacion(parsed.data);
    return NextResponse.json({ ok: true, code: reclamacion.code });
  } catch {
    return NextResponse.json(
      { ok: false, error: "No pudimos registrar tu hoja de reclamación. Intenta de nuevo más tarde." },
      { status: 502 }
    );
  }
}
