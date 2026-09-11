"use client";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/Button";
import { EASE } from "@/components/ui/Reveal";

const ASUNTOS = ["Visita", "Eventos", "Restaurante", "Prensa", "Otro"] as const;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type Status = "idle" | "loading" | "success" | "error";
type Errores = Record<string, string>;

type Payload = {
  nombre: string;
  email: string;
  telefono: string;
  asunto: string;
  mensaje: string;
  consentimiento: boolean;
  empresa: string;
};

/** Validación de cliente equivalente al esquema del servidor, sin cargar zod en el navegador. */
function validar(p: Payload): Errores {
  const e: Errores = {};
  if (p.nombre.trim().length < 2) e.nombre = "Ingresa tu nombre";
  if (!EMAIL_RE.test(p.email.trim())) e.email = "Ingresa un correo electrónico válido";
  if (!ASUNTOS.includes(p.asunto as (typeof ASUNTOS)[number])) e.asunto = "Selecciona un asunto";
  if (p.mensaje.trim().length < 10) e.mensaje = "Cuéntanos un poco más en tu mensaje";
  if (!p.consentimiento) e.consentimiento = "Debes aceptar el tratamiento de tus datos";
  return e;
}

/** Formulario de contacto → POST /api/contacto (DESIGN.md §7). */
export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [errores, setErrores] = useState<Errores>({});

  const campo = (name: string) => ({
    "aria-invalid": errores[name] ? true : undefined,
    "aria-describedby": errores[name] ? `${name}-error` : undefined,
  });

  const enfocar = (name: string) => {
    document.getElementById(name)?.focus();
  };

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    const payload: Payload = {
      nombre: String(data.get("nombre") ?? ""),
      email: String(data.get("email") ?? ""),
      telefono: String(data.get("telefono") ?? ""),
      asunto: String(data.get("asunto") ?? ""),
      mensaje: String(data.get("mensaje") ?? ""),
      consentimiento: data.get("consentimiento") === "on",
      empresa: String(data.get("empresa") ?? ""),
    };

    // Honeypot: si un bot rellena este campo oculto, fingimos éxito sin enviar nada.
    // El servidor hace la misma comprobación, así que un envío directo tampoco pasa.
    if (payload.empresa.length > 0) {
      setStatus("success");
      return;
    }

    const locales = validar(payload);
    if (Object.keys(locales).length > 0) {
      setErrores(locales);
      setErrorMsg("Revisa los campos marcados: falta corregir algún dato.");
      setStatus("error");
      enfocar(Object.keys(locales)[0]);
      return;
    }

    setStatus("loading");
    setErrorMsg(null);
    setErrores({});

    try {
      const res = await fetch("/api/contacto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = (await res.json()) as { ok: boolean; error?: string; campos?: Errores };
      if (!res.ok || !json.ok) {
        setErrorMsg(json.error ?? "No pudimos enviar tu mensaje. Intenta de nuevo en unos minutos.");
        const campos = json.campos ?? {};
        setErrores(campos);
        setStatus("error");
        const primero = Object.keys(campos)[0];
        if (primero) enfocar(primero);
        return;
      }
      setStatus("success");
      form.reset();
    } catch {
      setErrorMsg("No pudimos enviar tu mensaje. Revisa tu conexión e intenta de nuevo.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        role="status"
        className="border border-campina-500 bg-sillar-100 p-8"
      >
        <p className="t-h3 mb-2">Mensaje enviado</p>
        <p className="t-body text-volcan-700">
          Gracias por escribirnos. Te responderemos al correo que nos dejaste en 24–48 horas.
        </p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <div className="field">
        <label htmlFor="nombre">Nombre</label>
        <input id="nombre" name="nombre" type="text" autoComplete="name" maxLength={160} className="input" {...campo("nombre")} />
        {errores.nombre && <p id="nombre-error" className="field-error">{errores.nombre}</p>}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="field">
          <label htmlFor="email">Correo</label>
          <input id="email" name="email" type="email" autoComplete="email" maxLength={200} className="input" {...campo("email")} />
          {errores.email && <p id="email-error" className="field-error">{errores.email}</p>}
        </div>
        <div className="field">
          <label htmlFor="telefono">Teléfono (opcional)</label>
          <input id="telefono" name="telefono" type="tel" autoComplete="tel" maxLength={20} className="input" {...campo("telefono")} />
          {errores.telefono && <p id="telefono-error" className="field-error">{errores.telefono}</p>}
        </div>
      </div>

      <div className="field">
        <label htmlFor="asunto">Asunto</label>
        <select id="asunto" name="asunto" defaultValue="" className="input" {...campo("asunto")}>
          <option value="" disabled>
            Elige un asunto
          </option>
          {ASUNTOS.map((asunto) => (
            <option key={asunto} value={asunto}>
              {asunto}
            </option>
          ))}
        </select>
        {errores.asunto && <p id="asunto-error" className="field-error">{errores.asunto}</p>}
      </div>

      <div className="field">
        <label htmlFor="mensaje">Mensaje</label>
        <textarea id="mensaje" name="mensaje" maxLength={4000} rows={5} className="input" {...campo("mensaje")} />
        {errores.mensaje && <p id="mensaje-error" className="field-error">{errores.mensaje}</p>}
      </div>

      <div aria-hidden="true" className="absolute h-0 w-0 overflow-hidden opacity-0">
        <label htmlFor="empresa">No completar este campo</label>
        <input id="empresa" name="empresa" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="field">
        <label htmlFor="consentimiento" className="flex cursor-pointer items-start gap-3 !text-sm !normal-case !tracking-normal text-volcan-700">
          <input
            id="consentimiento"
            type="checkbox"
            name="consentimiento"
            className="mt-1 h-5 w-5 shrink-0 border border-sillar-300"
            {...campo("consentimiento")}
          />
          <span>
            Acepto que mis datos se usen para responder esta consulta, incluida su transferencia a encargados fuera del
            Perú, conforme a la{" "}
            <Link href="/legal/privacidad" className="link-line t-label-ocre !text-sm !tracking-normal !normal-case">
              política de privacidad
            </Link>
            .
          </span>
        </label>
        {errores.consentimiento && <p id="consentimiento-error" className="field-error">{errores.consentimiento}</p>}
      </div>

      <AnimatePresence>
        {status === "error" && errorMsg && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="alert"
            className="field-error"
          >
            {errorMsg}
          </motion.p>
        )}
      </AnimatePresence>

      <Button type="submit" disabled={status === "loading"} aria-disabled={status === "loading"}>
        {status === "loading" ? "Enviando…" : "Enviar mensaje"}
      </Button>
    </form>
  );
}
