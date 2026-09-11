"use client";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/Button";
import { EASE } from "@/components/ui/Reveal";

const ASUNTOS = ["Visita", "Eventos", "Restaurante", "Prensa", "Otro"] as const;

type Status = "idle" | "loading" | "success" | "error";

/** Formulario de contacto → POST /api/contacto (DESIGN.md §7). */
export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    // Honeypot: si un bot rellena este campo oculto, fingimos éxito sin enviar nada.
    if (String(data.get("empresa") ?? "").length > 0) {
      setStatus("success");
      return;
    }

    setStatus("loading");
    setErrorMsg(null);

    const payload = {
      nombre: String(data.get("nombre") ?? ""),
      email: String(data.get("email") ?? ""),
      telefono: String(data.get("telefono") ?? ""),
      asunto: String(data.get("asunto") ?? ""),
      mensaje: String(data.get("mensaje") ?? ""),
      consentimiento: data.get("consentimiento") === "on",
    };

    try {
      const res = await fetch("/api/contacto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !json.ok) {
        setErrorMsg(json.error ?? "No pudimos enviar tu mensaje. Intenta de nuevo en unos minutos.");
        setStatus("error");
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
          Gracias por escribirnos. Te responderemos al correo que nos dejaste lo antes posible.
        </p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <div className="field">
        <label htmlFor="nombre">Nombre</label>
        <input id="nombre" name="nombre" type="text" autoComplete="name" required maxLength={160} className="input" />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="field">
          <label htmlFor="email">Correo</label>
          <input id="email" name="email" type="email" autoComplete="email" required maxLength={200} className="input" />
        </div>
        <div className="field">
          <label htmlFor="telefono">Teléfono (opcional)</label>
          <input id="telefono" name="telefono" type="tel" autoComplete="tel" maxLength={20} className="input" />
        </div>
      </div>

      <div className="field">
        <label htmlFor="asunto">Asunto</label>
        <select id="asunto" name="asunto" required defaultValue="" className="input">
          <option value="" disabled>
            Elige un asunto
          </option>
          {ASUNTOS.map((asunto) => (
            <option key={asunto} value={asunto}>
              {asunto}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="mensaje">Mensaje</label>
        <textarea id="mensaje" name="mensaje" required minLength={10} maxLength={4000} rows={5} className="input" />
      </div>

      <div aria-hidden="true" className="absolute h-0 w-0 overflow-hidden opacity-0">
        <label htmlFor="empresa">No completar este campo</label>
        <input id="empresa" name="empresa" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <label className="flex items-start gap-3 text-sm text-volcan-700">
        <input type="checkbox" name="consentimiento" required className="mt-1 h-5 w-5 shrink-0 border border-sillar-300" />
        <span>
          Acepto que mis datos se usen para responder esta consulta, conforme a la{" "}
          <Link href="/legal/privacidad" className="link-line t-label-ocre !text-sm !tracking-normal !normal-case">
            política de privacidad
          </Link>
          .
        </span>
      </label>

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
