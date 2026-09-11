/** Mapa embebido de Google Maps, perezoso y con título accesible (DESIGN.md §7). */
export function MapEmbed({ title = "Mapa de ubicación del Molino de Sabandía" }: { title?: string }) {
  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden bg-sillar-100 sm:aspect-[16/9]">
      <div className="absolute inset-0 flex flex-col items-start justify-end gap-2 p-[clamp(16px,2vw,28px)]">
        <p className="t-label">Sabandía · Arequipa</p>
        <p className="t-h3 max-w-[24ch]">Calle El Molino s/n, a 8 km del Centro Histórico.</p>
        <a
          href="https://www.google.com/maps/search/?api=1&query=Molino+de+Saband%C3%ADa+Arequipa"
          target="_blank"
          rel="noopener noreferrer"
          className="link-line t-label-ocre"
        >
          Abrir en Google Maps
        </a>
      </div>
      <iframe
        src="https://www.google.com/maps?q=Molino+de+Sabandía+Arequipa&output=embed"
        title={title}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="absolute inset-0 h-full w-full border-0"
      />
    </div>
  );
}
