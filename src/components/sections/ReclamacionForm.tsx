"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { clsx } from "clsx";
import { Button } from "@/components/ui/Button";
import { TIPOS_DOCUMENTO, TIPOS_BIEN, TIPOS_RECLAMO } from "@/lib/reclamaciones/schema";
import { SITE } from "@/content/site";

type Status = "idle" | "loading" | "error";

/** Formulario del Libro de Reclamaciones → POST /api/reclamaciones (D.S. 011-2011-PCM / D.S. 101-2022-PCM). */
export function ReclamacionForm() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [esMenorDeEdad, setEsMenorDeEdad] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    if (String(data.get("sitioWeb") ?? "").length > 0) return; // honeypot

    setStatus("loading");
    setErrorMsg(null);

    const payload = {
      nombreCompleto: String(data.get("nombreCompleto") ?? ""),
      domicilio: String(data.get("domicilio") ?? ""),
      tipoDocumento: String(data.get("tipoDocumento") ?? ""),
      numeroDocumento: String(data.get("numeroDocumento") ?? ""),
      telefono: String(data.get("telefono") ?? ""),
      email: String(data.get("email") ?? ""),
      esMenorDeEdad,
      nombreTutor: String(data.get("nombreTutor") ?? ""),
      tipoBien: String(data.get("tipoBien") ?? ""),
      descripcionBien: String(data.get("descripcionBien") ?? ""),
      montoReclamado: String(data.get("montoReclamado") ?? ""),
      tipo: String(data.get("tipo") ?? ""),
      detalle: String(data.get("detalle") ?? ""),
      pedido: String(data.get("pedido") ?? ""),
      consentimiento: data.get("consentimiento") === "on",
    };

    try {
      const res = await fetch("/api/reclamaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = (await res.json()) as { ok: boolean; code?: string; error?: string };
      if (!res.ok || !json.ok || !json.code) {
        setErrorMsg(json.error ?? "No pudimos registrar tu hoja de reclamación. Intenta de nuevo.");
        setStatus("idle");
        return;
      }
      router.push(`/libro-de-reclamaciones/${json.code}`);
    } catch {
      setErrorMsg("No pudimos registrar tu hoja de reclamación. Revisa tu conexión e intenta de nuevo.");
      setStatus("idle");
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-8">
      <fieldset className="space-y-5">
        <legend className="t-h3 mb-1">1. Identificación del consumidor</legend>
        <div className="field">
          <label htmlFor="nombreCompleto">Nombre completo</label>
          <input id="nombreCompleto" name="nombreCompleto" type="text" required maxLength={160} className="input" />
        </div>
        <div className="field">
          <label htmlFor="domicilio">Domicilio</label>
          <input id="domicilio" name="domicilio" type="text" required maxLength={240} className="input" />
        </div>
        <div className="grid gap-5 sm:grid-cols-[140px_1fr]">
          <div className="field">
            <label htmlFor="tipoDocumento">Documento</label>
            <select id="tipoDocumento" name="tipoDocumento" required defaultValue="" className="input">
              <option value="" disabled>
                Tipo
              </option>
              {TIPOS_DOCUMENTO.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {tipo}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="numeroDocumento">Número de documento</label>
            <input id="numeroDocumento" name="numeroDocumento" type="text" required maxLength={20} className="input" />
          </div>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="field">
            <label htmlFor="telefono">Teléfono</label>
            <input id="telefono" name="telefono" type="tel" required maxLength={20} className="input" />
          </div>
          <div className="field">
            <label htmlFor="email">Correo electrónico</label>
            <input id="email" name="email" type="email" required maxLength={200} className="input" />
          </div>
        </div>
        <label className="flex items-start gap-3 text-sm text-volcan-700">
          <input
            type="checkbox"
            checked={esMenorDeEdad}
            onChange={(e) => setEsMenorDeEdad(e.target.checked)}
            className="mt-1 h-5 w-5 shrink-0 border border-sillar-300"
          />
          <span>Soy menor de edad</span>
        </label>
        {esMenorDeEdad && (
          <div className="field">
            <label htmlFor="nombreTutor">Nombre del padre, madre o tutor</label>
            <input id="nombreTutor" name="nombreTutor" type="text" required={esMenorDeEdad} maxLength={160} className="input" />
          </div>
        )}
      </fieldset>

      <fieldset className="space-y-5">
        <legend className="t-h3 mb-1">2. Identificación del bien contratado</legend>
        <div className="field">
          <label htmlFor="tipoBien">Bien contratado</label>
          <select id="tipoBien" name="tipoBien" required defaultValue="" className="input">
            <option value="" disabled>
              Elige una opción
            </option>
            {TIPOS_BIEN.map((tipo) => (
              <option key={tipo} value={tipo}>
                {tipo}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="descripcionBien">Descripción</label>
          <input id="descripcionBien" name="descripcionBien" type="text" required maxLength={300} className="input" />
        </div>
        <div className="field">
          <label htmlFor="montoReclamado">Monto reclamado ({SITE.currency}, opcional)</label>
          <input id="montoReclamado" name="montoReclamado" type="number" min={0} step="0.01" className="input" />
        </div>
      </fieldset>

      <fieldset className="space-y-5">
        <legend className="t-h3 mb-1">3. Detalle</legend>
        <fieldset className="field">
          <legend className="mb-1 text-[0.85rem] font-medium uppercase tracking-[0.04em] text-volcan-700">Tipo</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {TIPOS_RECLAMO.map((tipo) => (
              <label
                key={tipo}
                className={clsx(
                  "flex cursor-pointer items-start gap-3 border border-sillar-300 p-4 text-sm text-volcan-700 transition-colors has-[:checked]:border-agua-500"
                )}
              >
                <input type="radio" name="tipo" value={tipo} required className="mt-1 h-4 w-4 shrink-0" />
                <span>
                  <span className="block font-medium text-volcan-900">{tipo}</span>
                  {tipo === "Reclamo"
                    ? "Disconformidad con el producto o servicio."
                    : "Disconformidad no relacionada al producto o servicio, malestar por la atención."}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
        <div className="field">
          <label htmlFor="detalle">Detalle del reclamo o queja</label>
          <textarea id="detalle" name="detalle" required minLength={20} maxLength={4000} rows={5} className="input" />
        </div>
        <div className="field">
          <label htmlFor="pedido">Pedido del consumidor</label>
          <textarea id="pedido" name="pedido" required minLength={5} maxLength={2000} rows={3} className="input" />
        </div>
      </fieldset>

      <div aria-hidden="true" className="absolute h-0 w-0 overflow-hidden opacity-0">
        <label htmlFor="sitioWeb">No completar este campo</label>
        <input id="sitioWeb" name="sitioWeb" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <label className="flex items-start gap-3 text-sm text-volcan-700">
        <input type="checkbox" name="consentimiento" required className="mt-1 h-5 w-5 shrink-0 border border-sillar-300" />
        <span>Acepto que mis datos se usen para tramitar esta hoja de reclamación.</span>
      </label>

      {errorMsg && (
        <p role="alert" className="field-error">
          {errorMsg}
        </p>
      )}

      <Button type="submit" disabled={status === "loading"} aria-disabled={status === "loading"}>
        {status === "loading" ? "Enviando…" : "Enviar hoja de reclamación"}
      </Button>
    </form>
  );
}
