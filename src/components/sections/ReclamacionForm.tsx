"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { clsx } from "clsx";
import { Button } from "@/components/ui/Button";
import { TIPOS_DOCUMENTO, TIPOS_BIEN, TIPOS_RECLAMO } from "@/lib/reclamaciones/constants";
import { SITE } from "@/content/site";

type Status = "idle" | "loading";
type Errores = Record<string, string>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type Payload = {
  nombreCompleto: string;
  domicilio: string;
  tipoDocumento: string;
  numeroDocumento: string;
  telefono: string;
  email: string;
  esMenorDeEdad: boolean;
  nombreTutor: string;
  tipoBien: string;
  descripcionBien: string;
  montoReclamado: string;
  tipo: string;
  detalle: string;
  pedido: string;
  declaracion: boolean;
  honeypot: string;
};

/** Validación de cliente equivalente al esquema del servidor, sin cargar zod en el navegador. */
function validar(p: Payload): Errores {
  const e: Errores = {};
  if (p.nombreCompleto.trim().length < 3) e.nombreCompleto = "Ingresa tu nombre completo";
  if (p.domicilio.trim().length < 3) e.domicilio = "Ingresa tu domicilio";
  if (!TIPOS_DOCUMENTO.includes(p.tipoDocumento as (typeof TIPOS_DOCUMENTO)[number]))
    e.tipoDocumento = "Selecciona un tipo de documento";
  if (p.numeroDocumento.trim().length < 6) e.numeroDocumento = "Ingresa un número de documento válido";
  if (p.telefono.trim().length < 6) e.telefono = "Ingresa un teléfono válido";
  if (!EMAIL_RE.test(p.email.trim())) e.email = "Ingresa un correo electrónico válido";
  if (p.esMenorDeEdad && p.nombreTutor.trim().length === 0) e.nombreTutor = "Indica el nombre del padre, madre o tutor";
  if (!TIPOS_BIEN.includes(p.tipoBien as (typeof TIPOS_BIEN)[number])) e.tipoBien = "Selecciona producto o servicio";
  if (p.descripcionBien.trim().length < 3) e.descripcionBien = "Describe el bien contratado";
  if (p.montoReclamado.trim() !== "" && (Number.isNaN(Number(p.montoReclamado)) || Number(p.montoReclamado) < 0))
    e.montoReclamado = "Ingresa un monto válido";
  if (!TIPOS_RECLAMO.includes(p.tipo as (typeof TIPOS_RECLAMO)[number]))
    e.tipo = "Indica si es un reclamo o una queja";
  if (p.detalle.trim().length < 20) e.detalle = "Cuéntanos con más detalle qué ocurrió";
  if (p.pedido.trim().length < 5) e.pedido = "Indica qué solicitas al molino";
  if (!p.declaracion) e.declaracion = "Debes declarar que la información consignada es veraz";
  return e;
}

/** Formulario del Libro de Reclamaciones → POST /api/reclamaciones (D.S. 011-2011-PCM / D.S. 101-2022-PCM). */
export function ReclamacionForm() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [errores, setErrores] = useState<Errores>({});
  const [esMenorDeEdad, setEsMenorDeEdad] = useState(false);

  /** aria-invalid + aria-describedby para el control del campo indicado. */
  const campo = (name: string) => ({
    "aria-invalid": errores[name] ? true : undefined,
    "aria-describedby": errores[name] ? `${name}-error` : undefined,
  });

  const enfocar = (name: string) => {
    const el = document.getElementById(name) ?? document.querySelector<HTMLElement>(`[name="${name}"]`);
    el?.focus();
  };

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    const payload: Payload = {
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
      declaracion: data.get("declaracion") === "on",
      honeypot: String(data.get("honeypot") ?? ""),
    };

    const locales = validar(payload);
    if (Object.keys(locales).length > 0) {
      setErrores(locales);
      setErrorMsg("Revisa los campos marcados: falta corregir algún dato.");
      enfocar(Object.keys(locales)[0]);
      return;
    }

    setStatus("loading");
    setErrorMsg(null);
    setErrores({});

    try {
      const res = await fetch("/api/reclamaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = (await res.json()) as { ok: boolean; url?: string; error?: string; campos?: Errores };
      if (!res.ok || !json.ok || !json.url) {
        setErrorMsg(json.error ?? "No pudimos registrar tu hoja de reclamación. Intenta de nuevo.");
        const campos = json.campos ?? {};
        setErrores(campos);
        setStatus("idle");
        const primero = Object.keys(campos)[0];
        if (primero) enfocar(primero);
        return;
      }
      router.push(json.url);
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
          <input id="nombreCompleto" name="nombreCompleto" type="text" maxLength={160} className="input" {...campo("nombreCompleto")} />
          {errores.nombreCompleto && <p id="nombreCompleto-error" className="field-error">{errores.nombreCompleto}</p>}
        </div>
        <div className="field">
          <label htmlFor="domicilio">Domicilio</label>
          <input id="domicilio" name="domicilio" type="text" maxLength={240} className="input" {...campo("domicilio")} />
          {errores.domicilio && <p id="domicilio-error" className="field-error">{errores.domicilio}</p>}
        </div>
        <div className="grid gap-5 sm:grid-cols-[140px_1fr]">
          <div className="field">
            <label htmlFor="tipoDocumento">Documento</label>
            <select id="tipoDocumento" name="tipoDocumento" defaultValue="" className="input" {...campo("tipoDocumento")}>
              <option value="" disabled>
                Tipo
              </option>
              {TIPOS_DOCUMENTO.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {tipo}
                </option>
              ))}
            </select>
            {errores.tipoDocumento && <p id="tipoDocumento-error" className="field-error">{errores.tipoDocumento}</p>}
          </div>
          <div className="field">
            <label htmlFor="numeroDocumento">Número de documento</label>
            <input id="numeroDocumento" name="numeroDocumento" type="text" inputMode="numeric" maxLength={20} className="input" {...campo("numeroDocumento")} />
            {errores.numeroDocumento && <p id="numeroDocumento-error" className="field-error">{errores.numeroDocumento}</p>}
          </div>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="field">
            <label htmlFor="telefono">Teléfono</label>
            <input id="telefono" name="telefono" type="tel" autoComplete="tel" maxLength={20} className="input" {...campo("telefono")} />
            {errores.telefono && <p id="telefono-error" className="field-error">{errores.telefono}</p>}
          </div>
          <div className="field">
            <label htmlFor="email">Correo electrónico</label>
            <input id="email" name="email" type="email" autoComplete="email" maxLength={200} className="input" {...campo("email")} />
            {errores.email && <p id="email-error" className="field-error">{errores.email}</p>}
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
            <input id="nombreTutor" name="nombreTutor" type="text" maxLength={160} className="input" {...campo("nombreTutor")} />
            {errores.nombreTutor && <p id="nombreTutor-error" className="field-error">{errores.nombreTutor}</p>}
          </div>
        )}
      </fieldset>

      <fieldset className="space-y-5">
        <legend className="t-h3 mb-1">2. Identificación del bien contratado</legend>
        <div className="field">
          <label htmlFor="tipoBien">Bien contratado</label>
          <select id="tipoBien" name="tipoBien" defaultValue="" className="input" {...campo("tipoBien")}>
            <option value="" disabled>
              Elige una opción
            </option>
            {TIPOS_BIEN.map((tipo) => (
              <option key={tipo} value={tipo}>
                {tipo}
              </option>
            ))}
          </select>
          {errores.tipoBien && <p id="tipoBien-error" className="field-error">{errores.tipoBien}</p>}
        </div>
        <div className="field">
          <label htmlFor="descripcionBien">Descripción</label>
          <input id="descripcionBien" name="descripcionBien" type="text" maxLength={300} className="input" {...campo("descripcionBien")} />
          {errores.descripcionBien && <p id="descripcionBien-error" className="field-error">{errores.descripcionBien}</p>}
        </div>
        <div className="field">
          <label htmlFor="montoReclamado">Monto reclamado ({SITE.currency}, opcional)</label>
          <input id="montoReclamado" name="montoReclamado" type="number" min={0} step="0.01" className="input" {...campo("montoReclamado")} />
          {errores.montoReclamado && <p id="montoReclamado-error" className="field-error">{errores.montoReclamado}</p>}
        </div>
      </fieldset>

      <fieldset className="space-y-5">
        <legend className="t-h3 mb-1">3. Detalle</legend>
        <fieldset className="field" aria-describedby={errores.tipo ? "tipo-error" : undefined}>
          <legend className="mb-1 text-[0.85rem] font-medium uppercase tracking-[0.04em] text-volcan-700">Tipo</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {TIPOS_RECLAMO.map((tipo) => (
              <label
                key={tipo}
                className={clsx(
                  "flex cursor-pointer items-start gap-3 border p-4 text-sm text-volcan-700 transition-colors has-[:checked]:border-agua-500",
                  errores.tipo ? "border-alerta" : "border-sillar-300"
                )}
              >
                <input
                  id={tipo === TIPOS_RECLAMO[0] ? "tipo" : undefined}
                  type="radio"
                  name="tipo"
                  value={tipo}
                  className="mt-1 h-4 w-4 shrink-0"
                />
                <span>
                  <span className="block font-medium text-volcan-900">{tipo}</span>
                  {tipo === "Reclamo"
                    ? "Disconformidad con el producto o servicio."
                    : "Disconformidad no relacionada al producto o servicio, malestar por la atención."}
                </span>
              </label>
            ))}
          </div>
          {errores.tipo && <p id="tipo-error" className="field-error">{errores.tipo}</p>}
        </fieldset>
        <div className="field">
          <label htmlFor="detalle">Detalle del reclamo o queja</label>
          <textarea id="detalle" name="detalle" maxLength={4000} rows={5} className="input" {...campo("detalle")} />
          {errores.detalle && <p id="detalle-error" className="field-error">{errores.detalle}</p>}
        </div>
        <div className="field">
          <label htmlFor="pedido">Pedido del consumidor</label>
          <textarea id="pedido" name="pedido" maxLength={2000} rows={3} className="input" {...campo("pedido")} />
          {errores.pedido && <p id="pedido-error" className="field-error">{errores.pedido}</p>}
        </div>
      </fieldset>

      <div aria-hidden="true" className="absolute h-0 w-0 overflow-hidden opacity-0">
        <label htmlFor="honeypot">No completar este campo</label>
        <input id="honeypot" name="honeypot" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {/*
        Aviso informativo, no casilla: el tratamiento de estos datos se ampara en una
        obligación legal del proveedor (D.S. N.º 011-2011-PCM), excepción al consentimiento
        del art. 14.1 de la Ley N.º 29733.
      */}
      <p className="t-body max-w-prose-narrow border-l-2 border-sillar-300 pl-4 text-[0.95rem] text-volcan-700">
        Tratamos estos datos para registrar, atender y conservar esta hoja de reclamación en cumplimiento del D.S. N.º
        011-2011-PCM. No se apoya en tu consentimiento, sino en una obligación legal del proveedor, y conservamos la
        hoja por un plazo no menor a dos años. Responsable: {SITE.legalName}, {SITE.address.full}. Puedes ejercer tus
        derechos según la{" "}
        <Link href="/legal/privacidad" className="link-line t-label-ocre !text-sm !tracking-normal !normal-case">
          política de privacidad
        </Link>
        .
      </p>

      <div className="field">
        <label htmlFor="declaracion" className="flex cursor-pointer items-start gap-3 !text-sm !normal-case !tracking-normal text-volcan-700">
          <input
            id="declaracion"
            type="checkbox"
            name="declaracion"
            className="mt-1 h-5 w-5 shrink-0 border border-sillar-300"
            {...campo("declaracion")}
          />
          <span>Declaro que la información consignada en esta hoja de reclamación es veraz.</span>
        </label>
        {errores.declaracion && <p id="declaracion-error" className="field-error">{errores.declaracion}</p>}
      </div>

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
