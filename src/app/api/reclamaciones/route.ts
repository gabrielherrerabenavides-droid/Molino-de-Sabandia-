import { NextResponse } from "next/server";
import { camposConError, reclamacionSchema } from "@/lib/reclamaciones/schema";
import { REGISTRO_NO_DISPONIBLE, crearReclamacion, registroDisponible } from "@/lib/reclamaciones/service";
import { rateLimit, clientKey } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const { ok: withinLimit } = rateLimit(clientKey(request, "reclamaciones"));
  if (!withinLimit) {
    return NextResponse.json(
      { ok: false, error: "Demasiadas solicitudes. Intenta de nuevo en unos minutos." },
      { status: 429 }
    );
  }

  // Sin almacenamiento duradero no podemos conservar la hoja los 2 años que exige
  // el D.S. N.º 011-2011-PCM: preferimos no recoger los datos personales.
  if (!registroDisponible()) {
    return NextResponse.json({ ok: false, error: REGISTRO_NO_DISPONIBLE }, { status: 503 });
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
      {
        ok: false,
        error: parsed.error.issues[0]?.message ?? "Revisa los datos del formulario.",
        campos: camposConError(parsed.error),
      },
      { status: 400 }
    );
  }

  try {
    const reclamacion = await crearReclamacion(parsed.data);
    return NextResponse.json({ ok: true, url: `/libro-de-reclamaciones/${reclamacion.token}` });
  } catch {
    return NextResponse.json(
      { ok: false, error: "No pudimos registrar tu hoja de reclamación. Intenta de nuevo más tarde." },
      { status: 502 }
    );
  }
}
