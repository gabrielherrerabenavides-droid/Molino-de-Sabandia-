/**
 * Autenticación HTTP Basic para la zona de administración.
 * Sin dependencias de Node para poder usarse también desde `src/proxy.ts`.
 */

export type AdminAuthResult = "ok" | "unauthorized" | "unconfigured";

export const ADMIN_REALM = 'Basic realm="Molino de Sabandia - administracion", charset="UTF-8"';
export const ADMIN_UNCONFIGURED_MESSAGE = "Configura ADMIN_USER y ADMIN_PASSWORD";

function credentials(): { user: string; password: string } | null {
  const user = process.env.ADMIN_USER;
  const password = process.env.ADMIN_PASSWORD;
  if (!user || !password) return null;
  return { user, password };
}

/** Comparación de tiempo constante para no filtrar información por latencia. */
function safeEqual(a: string, b: string): boolean {
  const len = Math.max(a.length, b.length);
  let diff = a.length ^ b.length;
  for (let i = 0; i < len; i += 1) diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return diff === 0;
}

function decodeBase64Utf8(value: string): string | null {
  try {
    const binary = atob(value);
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  } catch {
    return null;
  }
}

/** Comprueba la cabecera `Authorization` contra ADMIN_USER / ADMIN_PASSWORD. */
export function checkAdminAuth(authorization: string | null): AdminAuthResult {
  const creds = credentials();
  if (!creds) return "unconfigured";
  if (!authorization || !/^Basic /i.test(authorization)) return "unauthorized";
  const decoded = decodeBase64Utf8(authorization.slice(6).trim());
  if (decoded === null) return "unauthorized";
  const sep = decoded.indexOf(":");
  if (sep < 0) return "unauthorized";
  const okUser = safeEqual(decoded.slice(0, sep), creds.user);
  const okPassword = safeEqual(decoded.slice(sep + 1), creds.password);
  return okUser && okPassword ? "ok" : "unauthorized";
}

/** Respuesta adecuada cuando la petición no está autorizada (o falta configuración). */
export function adminAuthResponse(result: Exclude<AdminAuthResult, "ok">): Response {
  if (result === "unconfigured") {
    return new Response(ADMIN_UNCONFIGURED_MESSAGE, {
      status: 503,
      headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" },
    });
  }
  return new Response("Autenticación requerida.", {
    status: 401,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "no-store",
      "www-authenticate": ADMIN_REALM,
    },
  });
}
