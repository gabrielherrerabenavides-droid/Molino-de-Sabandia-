/**
 * POST /api/admin/depurar — depuración manual de datos caducados.
 *
 * Borra las solicitudes de reserva cuya fecha de evento sea anterior a hoy
 * (hora de Lima) menos dos años, que es el plazo anunciado en `/legal/privacidad`.
 *
 * Las hojas del Libro de Reclamaciones NO se borran aquí a propósito: el
 * D.S. N.º 011-2011-PCM obliga a conservarlas un plazo NO MENOR a dos (2) años
 * y a exhibirlas ante INDECOPI, así que su depuración es manual y se decide hoja
 * por hoja (y solo una vez que el plazo aplicable a esa hoja ha vencido de verdad).
 *
 * Protegido con la misma comprobación Basic Auth asíncrona del resto de /api/admin.
 */
import { NextResponse } from "next/server";
import { adminAuthResponse, checkAdminAuth } from "@/lib/reservas/auth";
import { depurarReservasAntiguas } from "@/lib/reservas/service";

const NO_STORE = { "cache-control": "no-store" };

export async function POST(req: Request) {
  const auth = await checkAdminAuth(req.headers.get("authorization"));
  if (auth !== "ok") return adminAuthResponse(auth);

  try {
    const { corte, eliminadas } = await depurarReservasAntiguas();
    return NextResponse.json(
      {
        ok: true,
        eliminadas,
        corte,
        reclamaciones: "no se depuran automáticamente (conservación legal mínima de 2 años)",
      },
      { headers: NO_STORE },
    );
  } catch {
    return NextResponse.json(
      { ok: false, error: "No pudimos completar la depuración. Inténtalo de nuevo." },
      { status: 500, headers: NO_STORE },
    );
  }
}
