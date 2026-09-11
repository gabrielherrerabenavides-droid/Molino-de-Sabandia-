import { z } from "zod";
import { TIPOS_DOCUMENTO, TIPOS_BIEN, TIPOS_RECLAMO, ESTADOS_RECLAMACION } from "@/lib/reclamaciones/constants";

/** Libro de Reclamaciones — D.S. N.º 011-2011-PCM y D.S. N.º 101-2022-PCM. */
export * from "@/lib/reclamaciones/constants";

export const reclamacionSchema = z
  .object({
    nombreCompleto: z.string().trim().min(3, "Ingresa tu nombre completo").max(160),
    domicilio: z.string().trim().min(3, "Ingresa tu domicilio").max(240),
    tipoDocumento: z.enum(TIPOS_DOCUMENTO, { error: "Selecciona un tipo de documento" }),
    numeroDocumento: z.string().trim().min(6, "Ingresa un número de documento válido").max(20),
    telefono: z.string().trim().min(6, "Ingresa un teléfono válido").max(20),
    email: z.email("Ingresa un correo electrónico válido"),
    esMenorDeEdad: z.boolean(),
    nombreTutor: z.string().trim().max(160).optional(),
    tipoBien: z.enum(TIPOS_BIEN, { error: "Selecciona producto o servicio" }),
    descripcionBien: z.string().trim().min(3, "Describe el bien contratado").max(300),
    montoReclamado: z
      .string()
      .trim()
      .optional()
      .refine(
        (v) => v === undefined || v === "" || (!Number.isNaN(Number(v)) && Number(v) >= 0),
        "Ingresa un monto válido"
      ),
    tipo: z.enum(TIPOS_RECLAMO, { error: "Indica si es un reclamo o una queja" }),
    detalle: z.string().trim().min(20, "Cuéntanos con más detalle qué ocurrió").max(4000),
    pedido: z.string().trim().min(5, "Indica qué solicitas al molino").max(2000),
    /**
     * Declaración de veracidad: equivale a la suscripción (firma) de la hoja por el consumidor.
     * NO es un consentimiento de datos personales: el tratamiento se ampara en la obligación
     * legal del proveedor (art. 14.1 de la Ley N.º 29733 y D.S. N.º 011-2011-PCM).
     */
    declaracion: z.literal(true, { error: "Debes declarar que la información consignada es veraz" }),
    // Trampa antispam: se comprueba en el servidor, sin `.max(0)` para no delatarla con un error.
    honeypot: z.string().optional(),
  })
  .refine((data) => !data.esMenorDeEdad || Boolean(data.nombreTutor && data.nombreTutor.length > 0), {
    message: "Indica el nombre del padre, madre o tutor",
    path: ["nombreTutor"],
  });

export type ReclamacionInput = z.infer<typeof reclamacionSchema>;

/** Respuesta del proveedor: sección 4 de la Hoja de Reclamación. */
export const respuestaReclamacionSchema = z.object({
  respuesta: z.string().trim().min(10, "Escribe la respuesta al consumidor").max(4000),
  estado: z.enum(ESTADOS_RECLAMACION).optional(),
});

export type RespuestaReclamacionInput = z.infer<typeof respuestaReclamacionSchema>;

/** Filtro del panel de administración. */
export const reclamacionFiltroSchema = z.object({
  estado: z.enum(ESTADOS_RECLAMACION).optional(),
});

export type ReclamacionFiltro = z.infer<typeof reclamacionFiltroSchema>;

/** Mapa campo → primer mensaje de error, para enlazarlo al control en el formulario. */
export function camposConError(error: z.ZodError<unknown>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.map(String).join(".") || "_";
    if (!(key in out)) out[key] = issue.message;
  }
  return out;
}
