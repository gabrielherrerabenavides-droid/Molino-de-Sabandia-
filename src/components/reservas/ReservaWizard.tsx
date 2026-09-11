"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { EVENT_TYPES } from "@/content/site";
import { EASE } from "@/components/ui/Reveal";
import { useDisponibilidad } from "@/components/reservas/Calendario";
import { PASOS, WizardProgress } from "@/components/reservas/WizardProgress";
import { PasoConfirmar } from "@/components/reservas/PasoConfirmar";
import { PasoDatos, type DatosValores } from "@/components/reservas/PasoDatos";
import { PasoEvento } from "@/components/reservas/PasoEvento";
import { PasoFecha } from "@/components/reservas/PasoFecha";
import { monthOf, todayInTimeZone, type Slot } from "@/lib/reservas/availability";
import { datosStepSchema, fieldErrors } from "@/lib/reservas/schema";

/** A qué paso pertenece cada campo, para volver al sitio correcto si el servidor rechaza algo. */
const PASO_DE_CAMPO: Record<string, number> = {
  eventType: 0,
  date: 1,
  slot: 1,
  guests: 2,
  name: 2,
  email: 2,
  phone: 2,
  message: 2,
  consent: 3,
  terms: 3,
};

type RespuestaApi = { ok?: boolean; code?: string; error?: string; fields?: Record<string, string> };

export function ReservaWizard() {
  const router = useRouter();
  const reducido = useReducedMotion();

  const [paso, setPaso] = useState(0);
  const [direccion, setDireccion] = useState(1);

  const [eventType, setEventType] = useState<string | null>(null);
  const [mes, setMes] = useState(() => monthOf(todayInTimeZone()));
  const [fecha, setFecha] = useState<string | null>(null);
  const [slot, setSlot] = useState<Slot | null>(null);
  const [datos, setDatos] = useState<DatosValores>({
    name: "",
    email: "",
    phone: "",
    guests: "",
    message: "",
    website: "",
  });
  const [consent, setConsent] = useState(false);
  const [terms, setTerms] = useState(false);

  const [errores, setErrores] = useState<Record<string, string>>({});
  const [errorGlobal, setErrorGlobal] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const tipo = useMemo(() => EVENT_TYPES.find((t) => t.slug === eventType) ?? null, [eventType]);
  const { data, cargando, error: errorCalendario } = useDisponibilidad(mes, paso >= 1);

  const irA = (siguiente: number) => {
    setDireccion(siguiente > paso ? 1 : -1);
    setPaso(siguiente);
  };

  const elegirTipo = (slug: string) => {
    const nuevo = EVENT_TYPES.find((t) => t.slug === slug);
    setEventType(slug);
    setErrores({});
    setErrorGlobal(null);
    if (nuevo && slot && !nuevo.slots.includes(slot)) setSlot(null);
  };

  const elegirFecha = (date: string) => {
    setFecha(date);
    setErrores((prev) => ({ ...prev, date: "" }));
    const dia = data?.days.find((d) => d.date === date);
    if (slot && dia && !dia.slots[slot]) setSlot(null);
  };

  const cambiarDato = <K extends keyof DatosValores>(campo: K, valor: string) => {
    setDatos((prev) => ({ ...prev, [campo]: valor }));
    setErrores((prev) => ({ ...prev, [campo]: "" }));
  };

  const validarPaso = (indice: number): boolean => {
    if (indice === 0) {
      if (!tipo) {
        setErrorGlobal("Elige un tipo de evento para continuar.");
        return false;
      }
      return true;
    }
    if (indice === 1) {
      const nuevos: Record<string, string> = {};
      if (!fecha) nuevos.date = "Elige una fecha del calendario.";
      if (!slot) nuevos.slot = "Elige una franja horaria.";
      setErrores(nuevos);
      if (Object.keys(nuevos).length > 0) {
        setErrorGlobal("Necesitamos la fecha y la franja horaria.");
        return false;
      }
      return true;
    }
    if (indice === 2) {
      if (!tipo) return false;
      const parsed = datosStepSchema(tipo).safeParse({
        name: datos.name,
        email: datos.email,
        phone: datos.phone,
        guests: datos.guests,
        message: datos.message.trim() === "" ? undefined : datos.message,
      });
      if (!parsed.success) {
        setErrores(fieldErrors(parsed.error));
        setErrorGlobal("Revisa los campos marcados.");
        return false;
      }
      setErrores({});
      return true;
    }
    const nuevos: Record<string, string> = {};
    if (!consent) nuevos.consent = "Necesitamos tu autorización para tratar tus datos.";
    if (!terms) nuevos.terms = "Debes aceptar los términos y condiciones.";
    setErrores(nuevos);
    return Object.keys(nuevos).length === 0;
  };

  const continuar = () => {
    setErrorGlobal(null);
    if (!validarPaso(paso)) return;
    if (paso < PASOS.length - 1) {
      irA(paso + 1);
      return;
    }
    void enviar();
  };

  const enviar = async () => {
    if (!tipo || !fecha || !slot) return;
    setEnviando(true);
    setErrorGlobal(null);
    try {
      const res = await fetch("/api/reservas", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          eventType: tipo.slug,
          date: fecha,
          slot,
          guests: datos.guests,
          name: datos.name,
          email: datos.email,
          phone: datos.phone,
          message: datos.message.trim() === "" ? undefined : datos.message.trim(),
          consent,
          terms,
          website: datos.website,
        }),
      });
      const json: RespuestaApi = await res.json().catch(() => ({}));
      if (res.ok && json.code) {
        router.push(`/reservas/${json.code}`);
        return;
      }
      setErrores(json.fields ?? {});
      setErrorGlobal(json.error ?? "No pudimos enviar tu solicitud. Inténtalo de nuevo en unos minutos.");
      const primerCampo = Object.keys(json.fields ?? {})[0];
      const destino = primerCampo ? PASO_DE_CAMPO[primerCampo] : undefined;
      if (destino !== undefined && destino < paso) irA(destino);
      setEnviando(false);
    } catch {
      setErrorGlobal("No pudimos conectar con el molino. Revisa tu conexión e inténtalo de nuevo.");
      setEnviando(false);
    }
  };

  const desplazamiento = reducido ? 0 : 24;
  const transicion = reducido ? { duration: 0.001 } : { duration: 0.45, ease: EASE };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        continuar();
      }}
      noValidate
    >
      <WizardProgress paso={paso} onIr={irA} />

      <div className="relative mt-10 min-h-[420px] sm:mt-14">
        <AnimatePresence mode="wait" initial={false} custom={direccion}>
          <motion.div
            key={paso}
            custom={direccion}
            initial={{ opacity: 0, x: direccion * desplazamiento }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direccion * -desplazamiento }}
            transition={transicion}
          >
            {paso === 0 && <PasoEvento valor={eventType} onElegir={elegirTipo} />}

            {paso === 1 && tipo && (
              <PasoFecha
                mes={mes}
                onMes={setMes}
                disponibilidad={data}
                cargando={cargando}
                error={errorCalendario}
                slotsPermitidos={tipo.slots}
                fecha={fecha}
                slot={slot}
                onFecha={elegirFecha}
                onSlot={(s) => {
                  setSlot(s);
                  setErrores((prev) => ({ ...prev, slot: "" }));
                }}
                errorFecha={errores.date || errores.slot || undefined}
              />
            )}

            {paso === 2 && tipo && (
              <PasoDatos valores={datos} errores={errores} onCambio={cambiarDato} tipo={tipo} />
            )}

            {paso === 3 && tipo && fecha && slot && (
              <PasoConfirmar
                tipo={tipo}
                fecha={fecha}
                slot={slot}
                guests={datos.guests}
                name={datos.name}
                email={datos.email}
                phone={datos.phone}
                message={datos.message}
                consent={consent}
                terms={terms}
                errores={errores}
                onConsent={(v) => {
                  setConsent(v);
                  setErrores((prev) => ({ ...prev, consent: "" }));
                }}
                onTerms={(v) => {
                  setTerms(v);
                  setErrores((prev) => ({ ...prev, terms: "" }));
                }}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <p aria-live="assertive" className="min-h-6">
        {errorGlobal && (
          <span className="field-error border-l border-alerta py-1 pl-4 text-[0.95rem]">{errorGlobal}</span>
        )}
      </p>

      <div className="sticky bottom-0 z-10 -mx-[var(--gutter)] mt-8 border-t border-sillar-300 bg-sillar-50/95 px-[var(--gutter)] py-4 backdrop-blur-sm sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0 sm:backdrop-blur-none">
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => irA(Math.max(0, paso - 1))}
            disabled={paso === 0 || enviando}
          >
            Atrás
          </button>
          <button type="submit" className="btn btn-primary" disabled={enviando}>
            {paso === PASOS.length - 1 ? (enviando ? "Enviando…" : "Enviar solicitud") : "Continuar"}
          </button>
        </div>
      </div>
    </form>
  );
}
