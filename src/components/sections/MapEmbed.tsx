"use client";
import { useState } from "react";
import { SITE } from "@/content/site";

/**
 * Mapa de Google "a petición": hasta que el visitante pulsa el botón no se carga
 * ningún recurso de Google, así que el sitio no expone datos a terceros por defecto
 * (ver Política de cookies). El marcador de posición ya da la dirección y el enlace.
 */
export function MapEmbed({ title = "Mapa de ubicación del Molino de Sabandía" }: { title?: string }) {
  const [cargado, setCargado] = useState(false);

  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden bg-sillar-100 sm:aspect-[16/9]">
      {cargado ? (
        <iframe
          src="https://www.google.com/maps?q=Molino+de+Sabandía+Arequipa&output=embed"
          title={title}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="absolute inset-0 h-full w-full border-0"
        />
      ) : (
        <div className="sillar-pattern absolute inset-0 flex flex-col items-start justify-end gap-3 border border-sillar-200 p-[clamp(16px,2vw,28px)]">
          <p className="t-label">Sabandía · Arequipa</p>
          <p className="t-h3 max-w-[24ch]">{SITE.address.street}, a {SITE.distanceKm} km del Centro Histórico.</p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <button type="button" onClick={() => setCargado(true)} className="btn btn-ghost btn-sm">
              Cargar mapa de Google
            </button>
            <a href={SITE.mapsUrl} target="_blank" rel="noopener noreferrer" className="link-line t-label-ocre">
              Abrir en Google Maps
            </a>
          </div>
          <p className="text-[0.78rem] leading-snug text-muted">
            Al cargar el mapa, Google puede instalar cookies.
          </p>
        </div>
      )}
    </div>
  );
}
