import { SITE } from "@/content/site";

/** Estado de apertura calculado en hora de Lima. Seguro en servidor y cliente. */
export function getOpenStatus(now: Date = new Date()) {
  const fmt = new Intl.DateTimeFormat("en-US", { timeZone: SITE.hours.timezone, hour: "2-digit", minute: "2-digit", hour12: false, weekday: "short" });
  const parts = fmt.formatToParts(now);
  const hh = Number(parts.find((p) => p.type === "hour")?.value ?? "0") % 24;
  const mm = Number(parts.find((p) => p.type === "minute")?.value ?? "0");
  const wd = parts.find((p) => p.type === "weekday")?.value ?? "Sun";
  const dayIndex = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(wd);
  const minutes = hh * 60 + mm;
  const [oh, om] = SITE.hours.open.split(":").map(Number);
  const [ch, cm] = SITE.hours.close.split(":").map(Number);
  const openMin = oh * 60 + om;
  const closeMin = ch * 60 + cm;
  const opensToday = SITE.hours.days.includes(dayIndex);
  const isOpen = opensToday && minutes >= openMin && minutes < closeMin;
  const closeLabel = `${String(ch).padStart(2, "0")}:${String(cm).padStart(2, "0")}`;
  const openLabel = `${String(oh).padStart(2, "0")}:${String(om).padStart(2, "0")}`;
  return {
    isOpen,
    label: isOpen ? `Abierto hoy hasta las ${closeLabel} h` : minutes < openMin && opensToday ? `Abre hoy a las ${openLabel} h` : `Cerrado · abre mañana a las ${openLabel} h`,
    openLabel,
    closeLabel,
  };
}
