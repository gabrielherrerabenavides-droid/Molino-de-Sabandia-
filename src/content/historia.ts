import type { Photo } from "@/content/site";
import { PHOTOS } from "@/content/site";

export type Chapter = {
  id: string;
  navLabel: string;
  eyebrow: string;
  title: string;
  paragraphs: string[];
  /** Foto opcional a intercalar justo después del capítulo. */
  photo?: Photo;
};

/**
 * Capítulos de /historia. Contenido redactado a partir de TIMELINE/SERVICES
 * (src/content/site.ts) y de los hechos verificados listados en el brief del
 * agente de contenido. No se añaden fechas ni datos que no estén ahí.
 */
export const CHAPTERS: Chapter[] = [
  {
    id: "origen",
    navLabel: "El origen · 1621",
    eyebrow: "1621",
    title: "El origen",
    paragraphs: [
      "El 27 de agosto de 1621, ante el escribano Pedro Ibáñez de Irruegas, don García de Vargas Machuca encarga al maestro de arquitectura y cantería Francisco Flores levantar un molino en el asiento de Sabandía. Es el contrato que da inicio a la historia que sigue en pie cuatro siglos después.",
      "Durante generaciones, el molino abasteció de harina de trigo y de maíz a la ciudad de Arequipa. Su casona no era solo un lugar de trabajo: llegó a recibir a los virreyes en sus visitas a la región, señal del lugar que ocupaba en la vida de la campiña.",
    ],
  },
  {
    id: "arquitectura",
    navLabel: "La arquitectura de sillar",
    eyebrow: "Piedra",
    title: "La arquitectura de sillar",
    paragraphs: [
      "El molino se construyó enteramente en sillar, la piedra volcánica blanca de las canteras de Arequipa. Muros gruesos, contrafuertes y bóvedas de sillar sostienen el conjunto desde el siglo XVII, y son ellos los que han resistido cuatro siglos de sismos sin perder su forma.",
      "El edificio aprovecha el desnivel natural del terreno de Sabandía: la caída del suelo se convierte en la caída del agua que, más abajo, pone en marcha el mecanismo de molienda.",
    ],
    photo: PHOTOS.contrafuertes,
  },
  {
    id: "mecanismo",
    navLabel: "El mecanismo del agua",
    eyebrow: "Agua",
    title: "El mecanismo del agua",
    paragraphs: [
      "El agua baja por dos canales de sillar construidos junto con el molino y hace girar las volanderas, las piedras superiores que muelen el grano contra la piedra fija de abajo. Sin electricidad ni motor: solo gravedad, agua de manantial y la ingeniería del siglo XVII.",
      "Esa misma agua proviene del sistema de manantiales y andenería prehispánica de Yumina y Paucarpata, que desde mucho antes del molino ya ordenaba el agua de la campiña arequipeña.",
    ],
    photo: PHOTOS.escalera,
  },
  {
    id: "rescate",
    navLabel: "El rescate · 1971–1973",
    eyebrow: "1971–1973",
    title: "El rescate",
    paragraphs: [
      "El 28 de diciembre de 1972 el molino es declarado Patrimonio Cultural de la Nación. Un año antes, en 1971, el Banco Central Hipotecario del Perú había encargado su restauración al arquitecto Luis Felipe Calle.",
      "Calle vivió en el molino durante los trabajos y lo reconstruyó sin planos, guiado por la memoria de los campesinos que aún recordaban cómo había sido cada muro y cada canal. El molino restaurado se reinaugura el 14 de septiembre de 1973.",
    ],
  },
  {
    id: "paisaje",
    navLabel: "El paisaje de Sabandía",
    eyebrow: "Campiña",
    title: "El paisaje de Sabandía",
    paragraphs: [
      "El molino es hoy el único molino colonial de la región que sigue funcionando con la fuerza del agua. Está rodeado de la campiña de Sabandía, con sus acequias, jardines y andenes que reciben el agua de los manantiales de Yumina y Paucarpata.",
      "Desde el conjunto, la vista se abre hacia el Misti: el volcán que vigila Arequipa aparece detrás de los techos de sillar y los árboles de la campiña.",
    ],
    photo: PHOTOS.patio,
  },
  {
    id: "hoy",
    navLabel: "Hoy",
    eyebrow: "Hoy",
    title: "Hoy",
    paragraphs: [
      "Todavía llegan vecinos de la campiña con sacos de maíz, cebada y trigo para moler, como se ha hecho aquí desde el siglo XVII. El molino no es una reconstrucción congelada en el tiempo: sigue trabajando.",
      "Quien visita el molino hoy también se encuentra con los animales de la campiña —llamas, alpacas, vicuñas y cuyes— y con un lugar donde la piedra, el agua y la memoria conviven sin necesidad de explicarse.",
    ],
  },
];

export type Source = { label: string; detail: string };

/** Fuentes citadas en /historia. No añadir fuentes no verificadas. */
export const SOURCES: Source[] = [
  { label: "PROMPERÚ", detail: "Guía de Arequipa 2019" },
  { label: "PROMPERÚ", detail: "Rutas cortas desde Arequipa" },
  { label: "Diario Correo", detail: "Cobertura periodística sobre el Molino de Sabandía" },
];
