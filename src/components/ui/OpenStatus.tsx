"use client";

import { useEffect, useState } from "react";
import { clsx } from "clsx";
import { getOpenStatus } from "@/lib/hours";
import { SITE } from "@/content/site";

const FALLBACK = `Todos los días · ${SITE.hours.open} – ${SITE.hours.close} h`;

/**
 * Píldora de estado de apertura. El cálculo real se hace en el cliente
 * (hora de Lima) para evitar desajustes de hidratación; hasta entonces
 * muestra el horario fijo.
 */
export function OpenStatus({ tone = "light", className }: { tone?: "light" | "dark" | "ink"; className?: string }) {
  const [status, setStatus] = useState<{ isOpen: boolean; label: string } | null>(null);

  useEffect(() => {
    const tick = () => {
      const next = getOpenStatus();
      setStatus({ isOpen: next.isOpen, label: next.label });
    };
    tick();
    const id = window.setInterval(tick, 60_000);
    return () => window.clearInterval(id);
  }, []);

  const label = status?.label ?? FALLBACK;
  const dotOpen = status ? status.isOpen : true;

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
        className={clsx("size-2 shrink-0 rounded-full", dotOpen ? "bg-campina-500" : "bg-alerta")}
      />
      <span className="t-label t-label-inherit">{label}</span>
    </p>
  );
}
