"use client";

import type { EventType } from "@/content/site";
import { Campo } from "@/components/reservas/Campo";

export type DatosValores = {
  name: string;
  email: string;
  phone: string;
  guests: string;
  message: string;
  website: string;
};

type Props = {
  valores: DatosValores;
  errores: Record<string, string>;
  onCambio: <K extends keyof DatosValores>(campo: K, valor: string) => void;
  tipo: EventType;
};

function describedBy(id: string, error?: string, hint?: string) {
  if (error) return `${id}-error`;
  if (hint) return `${id}-hint`;
  return undefined;
}

/** Paso 3: datos de contacto. */
export function PasoDatos({ valores, errores, onCambio, tipo }: Props) {
  const hintInvitados = `Entre ${tipo.minGuests} y ${tipo.maxGuests} personas para ${tipo.title.toLowerCase()}.`;

  return (
    <div>
      <h2 className="t-h2 mb-2">¿Cómo te contactamos?</h2>
      <p className="t-body max-w-prose-narrow mb-8 text-muted">
        Con estos datos te confirmamos la disponibilidad y te enviamos las condiciones.
      </p>

      <div className="grid gap-6 sm:grid-cols-2">
        <Campo id="reserva-name" label="Nombre y apellido" error={errores.name}>
          <input
            id="reserva-name"
            name="name"
            className="input"
            type="text"
            autoComplete="name"
            required
            value={valores.name}
            aria-invalid={Boolean(errores.name)}
            aria-describedby={describedBy("reserva-name", errores.name)}
            onChange={(e) => onCambio("name", e.target.value)}
          />
        </Campo>

        <Campo id="reserva-email" label="Correo electrónico" error={errores.email}>
          <input
            id="reserva-email"
            name="email"
            className="input"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            value={valores.email}
            aria-invalid={Boolean(errores.email)}
            aria-describedby={describedBy("reserva-email", errores.email)}
            onChange={(e) => onCambio("email", e.target.value)}
          />
        </Campo>

        <Campo
          id="reserva-phone"
          label="Teléfono o WhatsApp"
          hint="Con código del Perú, por ejemplo 987 654 321."
          error={errores.phone}
        >
          <input
            id="reserva-phone"
            name="phone"
            className="input"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            required
            value={valores.phone}
            aria-invalid={Boolean(errores.phone)}
            aria-describedby={describedBy("reserva-phone", errores.phone, "hint")}
            onChange={(e) => onCambio("phone", e.target.value)}
          />
        </Campo>

        <Campo id="reserva-guests" label="Número de invitados" hint={hintInvitados} error={errores.guests}>
          <input
            id="reserva-guests"
            name="guests"
            className="input"
            type="number"
            inputMode="numeric"
            min={tipo.minGuests}
            max={tipo.maxGuests}
            step={1}
            required
            value={valores.guests}
            aria-invalid={Boolean(errores.guests)}
            aria-describedby={describedBy("reserva-guests", errores.guests, "hint")}
            onChange={(e) => onCambio("guests", e.target.value)}
          />
        </Campo>

        <div className="sm:col-span-2">
          <Campo
            id="reserva-message"
            label="Cuéntanos más (opcional)"
            hint="Horario aproximado, servicios que necesitas, número de mesas, catering…"
            error={errores.message}
          >
            <textarea
              id="reserva-message"
              name="message"
              className="input"
              rows={5}
              maxLength={1200}
              value={valores.message}
              aria-invalid={Boolean(errores.message)}
              aria-describedby={describedBy("reserva-message", errores.message, "hint")}
              onChange={(e) => onCambio("message", e.target.value)}
            />
          </Campo>
        </div>
      </div>

      {/* Trampa antispam: invisible para las personas, tentadora para los robots. */}
      <div aria-hidden className="pointer-events-none absolute size-0 overflow-hidden opacity-0">
        <label htmlFor="reserva-website">No rellenes este campo</label>
        <input
          id="reserva-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={valores.website}
          onChange={(e) => onCambio("website", e.target.value)}
        />
      </div>
    </div>
  );
}
