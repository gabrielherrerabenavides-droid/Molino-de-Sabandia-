"use client";

import { useEffect, useState } from "react";
import { clsx } from "clsx";
import { getOpenStatus } from "@/lib/hours";
import { SITE } from "@/content/site";

const FALLBACK = `Todos los días · ${SITE.hours.open} – ${SITE.hours.close} h`;

/**
 * Píldora de estado de apertura. El cálculo real se hace en el cliente
 * (hora de Lima) para evitar desajustes de hidratación; hasta entonces (HTML
 * del servidor, antes de hidratar o sin JS) muestra el horario fijo con un
 * punto neutro y sin halo: nunca afirma "abierto" sin saberlo.
 */
export function OpenStatus({ tone = "light", className }: { tone?: "light" | "dark" | "ink" | "plain"; className?: string }) {
  const [status, setStatus] = useState<{ state: "open" | "later" | "closed"; label: string } | null>(null);

  useEffect(() => {
    const tick = () => {
      const next = getOpenStatus();
      setStatus({ state: next.state, label: next.label });
    };
    tick();
    const id = window.setInterval(tick, 60_000);
    return () => window.clearInterval(id);
  }, []);

  const label = status?.label ?? FALLBACK;
  const dotOpen = status?.state === "open";
  // Neutro hasta conocer el estado · verde abierto · ocre abre más tarde hoy · rojo cerrado hasta mañana.
  const dotClass = !status
    ? tone === "ink"
      ? "bg-sillar-300"
      : "bg-sillar-50/45"
    : status.state === "open"
      ? "bg-campina-500"
      : status.state === "later"
        ? "bg-ocre-300"
        : "bg-alerta";

  if (tone === "plain") {
    // Versión desnuda para la portada (como "Abierto hasta las 20:00 h" del Guggenheim).
    return (
      <p className={clsx("inline-flex min-h-11 items-center gap-3 text-sillar-50 text-shade", className)}>
        <span aria-hidden="true" className="relative inline-flex size-2.5 shrink-0">
          {dotOpen && <span className="status-halo absolute inset-0 rounded-full bg-campina-500" />}
          <span className={clsx("relative size-2.5 rounded-full", dotClass)} />
        </span>
        <span className="text-[0.95rem] leading-snug md:text-[1.02rem]">{label}</span>
      </p>
    );
  }

  return (
    <p
      className={clsx(
        "inline-flex min-h-[36px] items-center gap-2.5 rounded-sm border px-3.5 py-2",
        tone === "light" && "border-sillar-50/35 bg-volcan-950/35 text-sillar-50 backdrop-blur-[2px]",
        tone === "dark" && "border-sillar-50/20 text-sillar-50",
        tone === "ink" && "border-sillar-300 bg-sillar-100 text-volcan-900",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={clsx("size-2 shrink-0 rounded-full", dotClass)}
      />
      <span className="t-label t-label-inherit">{label}</span>
    </p>
  );
}
