import { NextResponse } from "next/server";
import { z } from "zod";
import { sendMail, mailLayout } from "@/lib/email";
import { rateLimit, clientKey } from "@/lib/rate-limit";
import { SITE } from "@/content/site";

const ASUNTOS = ["Visita", "Eventos", "Restaurante", "Prensa", "Otro"] as const;

const contactoSchema = z.object({
  nombre: z.string().trim().min(2, "Ingresa tu nombre").max(160),
  email: z.email("Ingresa un correo electrónico válido"),
  telefono: z.string().trim().max(20).optional(),
  asunto: z.enum(ASUNTOS, { error: "Selecciona un asunto" }),
  mensaje: z.string().trim().min(10, "Cuéntanos un poco más en tu mensaje").max(4000),
  consentimiento: z.literal(true, { error: "Debes aceptar el tratamiento de tus datos" }),
  // Honeypot: los bots suelen rellenar cualquier campo extra; los humanos lo dejan vacío.
  empresa: z.string().max(0).optional(),
});

export async function POST(request: Request) {
  const { ok: withinLimit } = rateLimit(clientKey(request, "contacto"));
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

  // Trampa antispam: si viene rellena, respondemos como si todo hubiese ido bien
  // pero no enviamos nada. Nunca delatamos el campo con un error.
  if (typeof body === "object" && body !== null && String((body as Record<string, unknown>).empresa ?? "") !== "") {
    return NextResponse.json({ ok: true });
  }

  const parsed = contactoSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? "Revisa los datos del formulario." },
      { status: 400 }
    );
  }

  const { nombre, email, telefono, asunto, mensaje } = parsed.data;

  const resumenHtml = `
    <p><strong>Nombre:</strong> ${escapeHtml(nombre)}</p>
    <p><strong>Correo:</strong> ${escapeHtml(email)}</p>
    ${telefono ? `<p><strong>Teléfono:</strong> ${escapeHtml(telefono)}</p>` : ""}
    <p><strong>Asunto:</strong> ${escapeHtml(asunto)}</p>
    <p><strong>Mensaje:</strong><br>${escapeHtml(mensaje).replace(/\n/g, "<br>")}</p>
  `;

  const toMolino = await sendMail({
    to: SITE.contact.email,
    replyTo: email,
    subject: `Nuevo mensaje de contacto — ${asunto}`,
    html: mailLayout(`Contacto: ${asunto}`, resumenHtml),
  });

  if (!toMolino.ok) {
    return NextResponse.json(
      { ok: false, error: "No pudimos enviar tu mensaje. Intenta de nuevo más tarde." },
      { status: 502 }
    );
  }

  // Copia de cortesía al remitente, sin bloquear la respuesta si falla.
  await sendMail({
    to: email,
    subject: `Copia de tu mensaje a ${SITE.name}`,
    html: mailLayout("Recibimos tu mensaje", `<p>Hola ${escapeHtml(nombre)}:</p><p>Gracias por escribirnos. Este es un resumen de tu mensaje:</p>${resumenHtml}`),
  });

  return NextResponse.json({ ok: true });
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
