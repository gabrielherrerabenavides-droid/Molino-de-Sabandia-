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

export function clientKey(req: Request, scope: string) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? req.headers.get("x-real-ip") ?? "anon";
  return `${scope}:${ip}`;
}
