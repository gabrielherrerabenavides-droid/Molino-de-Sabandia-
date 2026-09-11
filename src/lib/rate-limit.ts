/** Limitador en memoria por instancia (suficiente para formularios públicos de bajo tráfico). */
const buckets = new Map<string, { count: number; reset: number }>();

export function rateLimit(key: string, limit = 5, windowMs = 10 * 60 * 1000): { ok: boolean; remaining: number } {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.reset < now) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    return { ok: true, remaining: limit - 1 };
  }
  if (b.count >= limit) return { ok: false, remaining: 0 };
  b.count += 1;
  return { ok: true, remaining: limit - b.count };
}

/**
 * Clave por cliente. Se prefiere `x-real-ip` porque es la cabecera que fija la
 * propia plataforma (Vercel) con la IP de la conexión TCP: el visitante no puede
 * falsearla. `x-forwarded-for` sí es una lista que el cliente puede prefijar con
 * valores inventados, y como el proxy de confianza añade la IP real al final, la
 * PRIMERA entrada es la que el cliente controla. Se usa solo como respaldo (por
 * ejemplo en `next start` local, donde no hay `x-real-ip`), asumiendo esa
 * limitación: en producción detrás de Vercel siempre gana `x-real-ip`.
 */
export function clientKey(req: Request, scope: string) {
  const realIp = req.headers.get("x-real-ip")?.trim();
  const forwarded = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = (realIp || forwarded || "anon").slice(0, 45);
  return `${scope}:${ip}`;
}
