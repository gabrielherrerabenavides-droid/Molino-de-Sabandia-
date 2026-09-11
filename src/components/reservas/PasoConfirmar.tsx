"use client";

import Link from "next/link";
import { clsx } from "clsx";
import type { EventType } from "@/content/site";
import { ResumenReserva } from "@/components/reservas/ResumenReserva";
import type { Slot } from "@/lib/reservas/availability";
import { fechaLarga, franjaLabel } from "@/lib/reservas/format";

type Props = {
  tipo: EventType;
  fecha: string;
  slot: Slot;
  guests: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  consent: boolean;
  terms: boolean;
  errores: Record<string, string>;
  onConsent: (valor: boolean) => void;
  onTerms: (valor: boolean) => void;
};

function Casilla({
  id,
  checked,
  onChange,
  error,
  children,
}: {
  id: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-start gap-3">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className={clsx(
            "mt-1 size-5 shrink-0 accent-volcan-950",
            error && "outline outline-1 outline-offset-2 outline-alerta",
          )}
        />
        <label htmlFor={id} className="text-[0.92rem] leading-relaxed text-volcan-700">
          {children}
        </label>
      </div>
      {error && (
        <p id={`${id}-error`} className="field-error mt-2 pl-8" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

/** Paso 4: resumen, consentimientos y envío. */
export function PasoConfirmar({
  tipo,
  fecha,
  slot,
  guests,
  name,
  email,
  phone,
  message,
  consent,
  terms,
  errores,
  onConsent,
  onTerms,
}: Props) {
  const filas = [
    { label: "Tipo de evento", value: tipo.title },
    { label: "Fecha", value: fechaLarga(fecha) },
    { label: "Franja", value: franjaLabel(slot) },
    { label: "Personas", value: guests },
    { label: "Nombre", value: name },
    { label: "Correo", value: email },
    { label: "Teléfono", value: phone },
    ...(message.trim() ? [{ label: "Mensaje", value: message.trim() }] : []),
  ];

  return (
    <div>
      <h2 className="t-h2 mb-2">Revisa y envía</h2>
      <p className="t-body max-w-prose-narrow mb-8 text-muted">
        Es una solicitud, todavía no una reserva. Te confirmamos la disponibilidad en 24 a 48 horas.
      </p>

      <ResumenReserva filas={filas} />

      <hr className="stone-rule my-8" />

      <div className="flex flex-col gap-5">
        <Casilla id="reserva-consent" checked={consent} onChange={onConsent} error={errores.consent}>
          Autorizo al Molino de Sabandía a tratar mis datos personales para gestionar esta solicitud, conforme a la
          Ley 29733 de Protección de Datos Personales. Consulta la{" "}
          <Link href="/legal/privacidad" className="link-line text-ocre-500">
            política de privacidad
          </Link>
          .
        </Casilla>

        <Casilla id="reserva-terms" checked={terms} onChange={onTerms} error={errores.terms}>
          He leído y acepto los{" "}
          <Link href="/legal/terminos" className="link-line text-ocre-500">
            términos y condiciones
          </Link>
          .
        </Casilla>
      </div>
    </div>
  );
}
