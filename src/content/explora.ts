import { PHOTOS, type Photo } from "@/content/site";

export type EditorialSection = {
  eyebrow: string;
  title: string;
  paragraphs: readonly string[];
  photo?: Photo;
  note?: string;
};

export type EditorialTopic = {
  slug: string;
  navLabel: string;
  eyebrow: string;
  title: string;
  lead: string;
  hero: Photo;
  sections: readonly EditorialSection[];
};

/** Textos breves de maqueta. Los datos específicos esperan la información del cliente. */
export const EDITORIAL_TOPICS: readonly EditorialTopic[] = [
  {
    slug: "arquitectura-rural-mestiza",
    navLabel: "Arquitectura rural mestiza",
    eyebrow: "Piedra · forma",
    title: "Arquitectura rural mestiza",
    lead: "Una construcción que se descubre en sus muros, arcos, patios y recorridos.",
    hero: PHOTOS.contrafuertes,
    sections: [
      {
        eyebrow: "01 / El conjunto",
        title: "La forma del molino",
        paragraphs: ["Los muros de sillar, las escaleras y los contrafuertes dan al molino una presencia inconfundible en la campiña arequipeña.", "Este espacio queda listo para incorporar la explicación del cliente sobre su arquitectura rural mestiza y las técnicas constructivas del lugar."],
        photo: PHOTOS.escalera,
      },
      {
        eyebrow: "02 / Mirar de cerca",
        title: "Detalles que permanecen",
        paragraphs: ["El recorrido propone mirar de cerca la textura de la piedra y la relación entre edificio y paisaje."],
        photo: PHOTOS.patio,
        note: "Texto arquitectónico específico pendiente de aprobación.",
      },
    ],
  },
  {
    slug: "tecnologia-hidraulica",
    navLabel: "Tecnología hidráulica",
    eyebrow: "Agua · movimiento",
    title: "Tecnología hidráulica",
    lead: "La fuerza del agua convirtió esta construcción en una máquina de molienda.",
    hero: PHOTOS.escalera,
    sections: [
      {
        eyebrow: "01 / La idea",
        title: "Una energía que viene del paisaje",
        paragraphs: ["El agua desciende por el canal y pone en movimiento la rueda. El eje transmite ese giro hasta las piedras de moler.", "La página está preparada para sumar fotografías propias del mecanismo y una explicación técnica confirmada por el molino."],
        photo: PHOTOS.contrafuertes,
        note: "La imagen actual muestra el edificio; falta una fotografía del mecanismo.",
      },
      {
        eyebrow: "02 / En movimiento",
        title: "Entenderlo paso a paso",
        paragraphs: ["En la portada hay un esquema interactivo del principio hidráulico: agua, movimiento y molienda."],
      },
    ],
  },
  {
    slug: "refugio-natural",
    navLabel: "Refugio natural",
    eyebrow: "Campiña · pausa",
    title: "Refugio natural",
    lead: "Fuera del ruido de la ciudad, el molino abre un recorrido entre árboles y jardines.",
    hero: PHOTOS.arboles,
    sections: [
      {
        eyebrow: "01 / El paisaje",
        title: "Caminar sin prisa",
        paragraphs: ["El camino de ingreso, la sombra de los árboles y el sillar crean otra manera de recorrer el molino.", "Aquí irá la historia que el cliente quiera contar sobre el entorno natural y su cuidado."],
        photo: PHOTOS.camino,
      },
      {
        eyebrow: "02 / El horizonte",
        title: "La campiña alrededor",
        paragraphs: ["Una vista amplia sitúa el conjunto dentro del paisaje de Sabandía."],
        photo: PHOTOS.panoramica,
      },
    ],
  },
  {
    slug: "fauna-nativa",
    navLabel: "Fauna nativa",
    eyebrow: "Vida · encuentro",
    title: "Fauna nativa",
    lead: "Un espacio para presentar a los animales del molino y su relación con la campiña.",
    hero: PHOTOS.camino,
    sections: [
      {
        eyebrow: "01 / Conocerlos",
        title: "Los habitantes del lugar",
        paragraphs: ["Esta sección está lista para incorporar fotografías reales de los animales, los nombres de las especies presentes y recomendaciones de visita confirmadas por el equipo del molino."],
        photo: PHOTOS.arboles,
        note: "La foto actual muestra el entorno. Faltan imágenes propias de la fauna.",
      },
    ],
  },
  {
    slug: "food-truck",
    navLabel: "Food Truck",
    eyebrow: "Una nueva parada",
    title: "Food Truck",
    lead: "Un apartado para presentar la propuesta gastronómica del molino cuando esté definida.",
    hero: PHOTOS.patio,
    sections: [
      {
        eyebrow: "01 / La propuesta",
        title: "Una pausa en el recorrido",
        paragraphs: ["Aquí irán la foto real del food truck, su carta, los horarios y la información de servicio que confirme el cliente."],
        photo: PHOTOS.arboles,
        note: "Fotos de contexto. Oferta, precios y horarios pendientes de confirmar.",
      },
    ],
  },
  {
    slug: "400-anos-despues",
    navLabel: "El Molino de Sabandía: 400 años después",
    eyebrow: "1621 · hoy",
    title: "El Molino de Sabandía: 400 años después",
    lead: "Un puente visual entre el molino de archivo y el lugar que hoy recibe visitantes.",
    hero: PHOTOS.historica,
    sections: [
      {
        eyebrow: "01 / Ayer",
        title: "La memoria de la piedra",
        paragraphs: ["La fotografía de archivo registra el molino después de su restauración de 1973. Es el punto de partida para contar cómo cambió el lugar."],
        photo: PHOTOS.patio,
      },
      {
        eyebrow: "02 / Hoy",
        title: "La historia continúa",
        paragraphs: ["Hoy el conjunto puede recorrerse de nuevo. Esta sección espera testimonios, fotografías actuales y los proyectos que el cliente quiera mostrar para el futuro."],
        photo: PHOTOS.fachada,
        note: "Relato contemporáneo pendiente de aprobación.",
      },
    ],
  },
];

export const HALL_OF_FAME = {
  slug: "salon-de-la-fama",
  navLabel: "Nuestro salón de la fama",
  eyebrow: "Los toros del molino",
  title: "Nuestro salón de la fama",
  lead: "Un espacio para conocer a cada ejemplar por separado, con su fotografía y su historia.",
  bulls: [
    { id: "01", image: "/images/toro-referencial-oscuro.webp", coat: "Pelaje oscuro" },
    { id: "02", image: "/images/toro-referencial-castano.webp", coat: "Pelaje castaño" },
  ],
} as const;

export const EXPLORE_PATHS = [
  ...EDITORIAL_TOPICS.map((topic) => topic.slug),
  HALL_OF_FAME.slug,
];
