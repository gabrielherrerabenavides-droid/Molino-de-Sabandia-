import { Resend } from "resend";
import { SITE } from "@/content/site";

/**
 * Envío de correo con Resend. Si RESEND_API_KEY no está configurada, no falla:
 * devuelve { skipped: true } y deja constancia en logs (solo en desarrollo).
 */
export type Mail = { to: string | string[]; subject: string; html: string; text?: string; replyTo?: string };

export async function sendMail(mail: Mail): Promise<{ ok: boolean; skipped?: boolean; id?: string; error?: string }> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.MAIL_FROM ?? `${SITE.name} <no-reply@molinodesabandia.com>`;
  if (!key) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`[email] RESEND_API_KEY no configurada. Correo omitido → ${Array.isArray(mail.to) ? mail.to.join(", ") : mail.to}: ${mail.subject}`);
    }
    return { ok: true, skipped: true };
  }
  try {
    const resend = new Resend(key);
    const { data, error } = await resend.emails.send({ from, to: mail.to, subject: mail.subject, html: mail.html, text: mail.text, replyTo: mail.replyTo });
    if (error) return { ok: false, error: error.message };
    return { ok: true, id: data?.id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Error desconocido" };
  }
}

/** Plantilla mínima coherente con la identidad (sillar / volcán). */
export function mailLayout(title: string, bodyHtml: string) {
  return `<!doctype html><html lang="es"><body style="margin:0;background:#f7f5ef;font-family:Arial,Helvetica,sans-serif;color:#1b1c19">
  <div style="max-width:600px;margin:0 auto;padding:32px 24px">
    <p style="font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#8a6a34;margin:0 0 8px">${SITE.name} · Arequipa</p>
    <h1 style="font-size:26px;line-height:1.1;margin:0 0 20px;font-weight:600">${title}</h1>
    <div style="font-size:16px;line-height:1.6">${bodyHtml}</div>
    <hr style="border:0;border-top:1px solid #cfc9b8;margin:28px 0">
    <p style="font-size:12px;color:#63655c;margin:0">${SITE.address.full}<br>${SITE.contact.email}</p>
  </div></body></html>`;
}
