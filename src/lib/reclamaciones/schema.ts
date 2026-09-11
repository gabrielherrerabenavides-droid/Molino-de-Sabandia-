import { z } from "zod";

/** Libro de Reclamaciones — D.S. N.º 011-2011-PCM y D.S. N.º 101-2022-PCM. */
export const TIPOS_DOCUMENTO = ["DNI", "CE"] as const;
export const TIPOS_BIEN = ["Producto", "Servicio"] as const;
export const TIPOS_RECLAMO = ["Reclamo", "Queja"] as const;

export type TipoDocumento = (typeof TIPOS_DOCUMENTO)[number];
export type TipoBien = (typeof TIPOS_BIEN)[number];
export type TipoReclamo = (typeof TIPOS_RECLAMO)[number];

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
    consentimiento: z.literal(true, { error: "Debes aceptar el tratamiento de tus datos" }),
    honeypot: z.string().max(0).optional(),
  })
  .refine((data) => !data.esMenorDeEdad || Boolean(data.nombreTutor && data.nombreTutor.length > 0), {
    message: "Indica el nombre del padre, madre o tutor",
    path: ["nombreTutor"],
  });

export type ReclamacionInput = z.infer<typeof reclamacionSchema>;
