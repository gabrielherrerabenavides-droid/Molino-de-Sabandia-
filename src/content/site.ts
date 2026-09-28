/**
 * Fuente única de datos del sitio. Los datos marcados con TODO son provisionales
 * y deben confirmarse con la administración del molino antes del lanzamiento.
 */
export const SITE = {
  name: "Molino de Sabandía",
  legalName: "Molino de Sabandía", // TODO confirmar razón social y RUC
  ruc: "", // TODO confirmar
  tagline: "La historia sigue en movimiento",
  description:
    "Molino colonial de 1621 en Sabandía, Arequipa. Único molino de la región que sigue moliendo con la fuerza del agua. Patrimonio Cultural de la Nación. Visitas, restaurante y eventos entre sillar, agua y campiña.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://molinodesabandia.com", // TODO dominio definitivo
  founded: 1621,
  address: {
    street: "Calle El Molino s/n",
    district: "Sabandía",
    city: "Arequipa",
    region: "Arequipa",
    country: "Perú",
    postalCode: "04012",
    full: "Calle El Molino s/n, Sabandía, Arequipa, Perú",
  },
  geo: { lat: -16.4548, lng: -71.4909 }, // TODO confirmar coordenadas exactas
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=Molino+de+Saband%C3%ADa+Arequipa",
  contact: {
    phone: "", // TODO confirmar
    whatsapp: "", // TODO confirmar (formato internacional sin +, ej. 51987654321)
    email: "elmolinodesabandia@gmail.com", // TODO confirmar (correo asociado a la página de Facebook)
    instagram: "", // TODO
    facebook: "https://www.facebook.com/elmolinodesabandia/",
    tiktok: "", // TODO
  },
  /** Horario en hora de Lima (America/Lima). 0 = domingo … 6 = sábado. */
  hours: {
    timezone: "America/Lima",
    days: [0, 1, 2, 3, 4, 5, 6] as number[],
    open: "08:00",
    close: "18:00",
    note: "Abierto todos los días del año.",
  },
  admission: [
    { label: "Adultos", price: 10 as number | null, detail: "De 12 a 59 años" },
    { label: "Niños", price: 5 as number | null, detail: "De 6 a 11 años" },
    { label: "Primera infancia", price: 0 as number | null, detail: "De 0 a 5 años" },
    { label: "Adultos mayores", price: 5 as number | null, detail: "Desde los 60 años" },
  ],
  currency: "S/",
  distanceKm: 8,
  travel: [
    { mode: "Taxi", detail: "≈ 15 min desde el Centro Histórico", cost: "≈ S/ 15" },
    { mode: "Bus", detail: "Ruta Sabandía desde Av. Independencia", cost: "≈ S/ 2" },
    { mode: "Auto", detail: "8 km al sureste · estacionamiento", cost: "" },
  ],
} as const;

export const NAV = [
  { href: "/", label: "Inicio" },
  { href: "/historia", label: "Historia" },
  { href: "/galeria", label: "Galería" },
  { href: "/eventos", label: "Eventos" },
  { href: "/visita", label: "Tu visita" },
  { href: "/contacto", label: "Contacto" },
] as const;

export const LEGAL_NAV = [
  { href: "/legal/privacidad", label: "Política de privacidad" },
  { href: "/legal/terminos", label: "Términos y condiciones" },
  { href: "/legal/cookies", label: "Política de cookies" },
  { href: "/libro-de-reclamaciones", label: "Libro de reclamaciones" },
] as const;

export type Photo = {
  src: string;
  alt: string;
  caption: string;
  width: number;
  height: number;
  author: string;
  year: string;
  license: string;
  source: string;
};

/** Fotografías provisionales (Wikimedia Commons). Reemplazar por material propio del molino. */
export const PHOTOS: Record<string, Photo> = {
  fachada: {
    src: "/images/fachada-jardines.webp", alt: "Fachada de sillar del Molino de Sabandía rodeada de jardines",
    caption: "La fachada de sillar desde los jardines", width: 1920, height: 1440,
    author: "Sjoerd van Wijk", year: "2010", license: "Dominio público",
    source: "https://commons.wikimedia.org/wiki/File:Molino_sabandia.jpg",
  },
  panoramica: {
    src: "/images/panoramica-sabandia.webp", alt: "Panorámica del Molino de Sabandía y sus jardines",
    caption: "El molino y todo lo que lo rodea", width: 1920, height: 451,
    author: "Santiagostucchi", year: "2016", license: "CC BY-SA 4.0",
    source: "https://commons.wikimedia.org/wiki/File:Arequipasabandia.jpg",
  },
  camino: {
    src: "/images/camino-ingreso.webp", alt: "Camino de ingreso al Molino de Sabandía bajo los árboles",
    caption: "El comienzo del camino", width: 1920, height: 1440,
    author: "Daniela Rendon Zuñiga", year: "2018", license: "CC BY-SA 4.0",
    source: "https://commons.wikimedia.org/wiki/File:Molino_de_sabandia.jpg",
  },
  arboles: {
    src: "/images/molino-entre-arboles.webp", alt: "El molino entre árboles de la campiña",
    caption: "Un refugio entre árboles", width: 1200, height: 1600,
    author: "Hugovisor", year: "2016", license: "CC BY-SA 4.0",
    source: "https://commons.wikimedia.org/wiki/File:Molino_sabandia_arequipa.jpg",
  },
  historica: {
    src: "/images/vista-historica.webp", alt: "Vista histórica del Molino de Sabandía en 1981",
    caption: "El molino tras la restauración", width: 1051, height: 705,
    author: "LBM1948", year: "1981", license: "CC BY-SA 4.0",
    source: "https://commons.wikimedia.org/wiki/File:Saband%C3%ADa_1981_01.jpg",
  },
  contrafuertes: {
    src: "/images/contrafuertes-1981.webp", alt: "Contrafuertes y muros de sillar del molino, 1981",
    caption: "La geometría del sillar", width: 1063, height: 692,
    author: "LBM1948", year: "1981", license: "CC BY-SA 4.0",
    source: "https://commons.wikimedia.org/wiki/File:Saband%C3%ADa_1981_02.jpg",
  },
  escalera: {
    src: "/images/escalera-sillar.webp", alt: "Escalera y arco de sillar del molino",
    caption: "Piedra que sube hacia el agua", width: 669, height: 1027,
    author: "LBM1948", year: "1981", license: "CC BY-SA 4.0",
    source: "https://commons.wikimedia.org/wiki/File:Saband%C3%ADa_1981_05.jpg",
  },
  patio: {
    src: "/images/patio-1981.webp", alt: "Patio del Molino de Sabandía fotografiado en 1981",
    caption: "El patio interior", width: 1920, height: 768,
    author: "LBM1948", year: "1981", license: "CC BY-SA 4.0",
    source: "https://commons.wikimedia.org/wiki/File:Arequipa_1981,_panor%C3%A1mica_03.jpg",
  },
};

export const TIMELINE = [
  { year: "1621", title: "Nace el molino", text: "El 27 de agosto de 1621, don García de Vargas Machuca encarga, ante el escribano Pedro Ibáñez de Irruegas, al maestro de arquitectura y cantería Francisco Flores levantar un molino en el asiento de Sabandía. Durante siglos abasteció de harina de trigo y maíz a Arequipa y su casona llegó a recibir a los virreyes." },
  { year: "1972", title: "Patrimonio Cultural de la Nación", text: "El 28 de diciembre de 1972 el molino es declarado Patrimonio Cultural de la Nación." },
  { year: "1973", title: "El rescate", text: "Abandonado por la molienda moderna, el Banco Central Hipotecario del Perú encarga su restauración al arquitecto Luis Felipe Calle, que vive en el lugar durante los trabajos y lo reconstruye sin planos, guiado por la memoria de los campesinos. Se reinaugura el 14 de septiembre de 1973." },
  { year: "Hoy", title: "Sigue girando", text: "Único molino colonial de la región que sigue moliendo con la fuerza del agua. Vecinos de la campiña todavía llegan con sacos de maíz, cebada y trigo." },
] as const;

export const SERVICES = [
  { slug: "molienda", title: "Molienda en vivo", text: "El agua cae, la rueda gira y las piedras muelen el grano como hace cuatro siglos. Sin motor ni electricidad: gravedad, agua de manantial e ingenio del siglo XVII." },
  { slug: "restaurante", title: "Restaurante", text: "Cocina tradicional arequipeña en un entorno colonial, rodeado de jardines y acequias." },
  { slug: "eventos", title: "Eventos y sesiones", text: "Bodas, sesiones fotográficas de novios, quinceañeras, promociones y eventos corporativos en uno de los escenarios más bellos de la campiña." },
  { slug: "campina", title: "Paseo por la campiña", text: "Recorre los jardines, conoce a las llamas, alpacas, vicuñas y cuyes, monta a caballo por la campiña y mira el Misti desde la campiña de Sabandía." },
] as const;

export type EventType = {
  slug: string;
  title: string;
  short: string;
  text: string;
  minGuests: number;
  maxGuests: number;
  slots: readonly ("manana" | "tarde" | "dia")[];
};

export const EVENT_TYPES: readonly EventType[] = [
  { slug: "boda", title: "Boda", short: "Ceremonia y recepción entre sillar y jardines.", text: "Ceremonia civil o religiosa al aire libre, recepción en los jardines y fotografías con el molino y el Misti de fondo.", minGuests: 30, maxGuests: 400, slots: ["tarde", "dia"] },
  { slug: "sesion-fotografica", title: "Sesión fotográfica", short: "Novios, promociones, quinceañeras, familias.", text: "Acceso al conjunto para sesiones profesionales: fachada de sillar, escaleras, acequias, campiña y animales.", minGuests: 1, maxGuests: 30, slots: ["manana", "tarde"] },
  { slug: "quinceanera", title: "Quinceañera", short: "Una fiesta de quince en la campiña.", text: "Celebración de quince años con ceremonia, recepción y sesión de fotos en el molino.", minGuests: 30, maxGuests: 300, slots: ["tarde", "dia"] },
  { slug: "corporativo", title: "Evento corporativo", short: "Reuniones, lanzamientos y días de integración.", text: "Espacios al aire libre y bajo techo para reuniones, lanzamientos, activaciones y días de integración.", minGuests: 10, maxGuests: 300, slots: ["manana", "tarde", "dia"] },
  { slug: "grupo", title: "Visita en grupo", short: "Colegios, universidades y agencias.", text: "Visita guiada para colegios, universidades y agencias de viaje, con explicación del mecanismo hidráulico y de la historia del molino.", minGuests: 10, maxGuests: 120, slots: ["manana", "tarde"] },
  { slug: "otro", title: "Otra celebración", short: "Cumpleaños, aniversarios, bautizos…", text: "Cuéntanos qué quieres celebrar y te ayudamos a organizarlo.", minGuests: 1, maxGuests: 400, slots: ["manana", "tarde", "dia"] },
] as const;

export const SLOT_LABELS: Record<"manana" | "tarde" | "dia", string> = {
  manana: "Mañana (9:00 – 13:00)",
  tarde: "Tarde (14:00 – 20:00)",
  dia: "Día completo",
};

export const FAQ = [
  { q: "¿Cuánto dura la visita?", a: "Entre una y dos horas, según el ritmo. Hay recorrido por el mecanismo hidráulico, los jardines y la campiña." },
  { q: "¿Es accesible?", a: "El conjunto tiene escaleras y desniveles de piedra. Si necesitas una ruta accesible o apoyo particular, consúltanos antes de tu visita." },
  { q: "¿Se puede comer en el molino?", a: "Sí. El restaurante ofrece cocina tradicional arequipeña. Consulta horarios y disponibilidad." },
  { q: "¿Puedo hacer una sesión de fotos?", a: "Sí. Las sesiones profesionales requieren reserva previa. Usa el formulario de reservas y te confirmamos condiciones y disponibilidad." },
  { q: "¿Cómo llego desde el centro de Arequipa?", a: "Sabandía está a unos 8 km al sureste del Centro Histórico. En taxi son unos 15 minutos; también hay buses hacia Sabandía." },
] as const;
