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

async function sha256(value: string): Promise<Uint8Array> {
  return new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)));
}

/**
 * Comparación en tiempo constante: compara los resúmenes SHA-256 (32 bytes fijos),
 * así el número de operaciones no depende de la longitud del intento ni del secreto.
 */
async function safeEqual(a: string, b: string): Promise<boolean> {
  const [da, db] = await Promise.all([sha256(a), sha256(b)]);
  let diff = 0;
  for (let i = 0; i < da.length; i += 1) diff |= da[i] ^ db[i];
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
export async function checkAdminAuth(authorization: string | null): Promise<AdminAuthResult> {
  const creds = credentials();
  if (!creds) return "unconfigured";
  if (!authorization || !/^Basic /i.test(authorization)) return "unauthorized";
  const decoded = decodeBase64Utf8(authorization.slice(6).trim());
  if (decoded === null) return "unauthorized";
  const sep = decoded.indexOf(":");
  if (sep < 0) return "unauthorized";
  const [okUser, okPassword] = await Promise.all([
    safeEqual(decoded.slice(0, sep), creds.user),
    safeEqual(decoded.slice(sep + 1), creds.password),
  ]);
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
