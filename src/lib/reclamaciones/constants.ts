/**
 * Constantes del Libro de Reclamaciones (D.S. N.º 011-2011-PCM y D.S. N.º 101-2022-PCM).
 * Módulo sin dependencias: el formulario de cliente lo importa sin arrastrar zod al bundle.
 */
export const TIPOS_DOCUMENTO = ["DNI", "CE"] as const;
export const TIPOS_BIEN = ["Producto", "Servicio"] as const;
export const TIPOS_RECLAMO = ["Reclamo", "Queja"] as const;
export const ESTADOS_RECLAMACION = ["pendiente", "respondida"] as const;

export type TipoDocumento = (typeof TIPOS_DOCUMENTO)[number];
export type TipoBien = (typeof TIPOS_BIEN)[number];
export type TipoReclamo = (typeof TIPOS_RECLAMO)[number];
export type EstadoReclamacion = (typeof ESTADOS_RECLAMACION)[number];

export const ESTADO_LABELS: Record<EstadoReclamacion, string> = {
  pendiente: "Pendiente",
  respondida: "Respondida",
};

/** Plazo legal de respuesta al consumidor (D.S. N.º 011-2011-PCM). */
export const PLAZO_RESPUESTA = "quince (15) días hábiles";
