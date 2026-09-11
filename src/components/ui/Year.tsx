"use client";

import { useSyncExternalStore } from "react";

/**
 * Año en curso, calculado en el cliente.
 *
 * Las páginas públicas se prerenderizan en el build y se cachean sin
 * revalidación: un `new Date().getFullYear()` en el servidor congelaría el año
 * del footer hasta el siguiente despliegue. `useSyncExternalStore` devuelve el
 * año de referencia durante el prerenderizado y la hidratación, y React vuelve
 * a renderizar con el año real del navegador en cuanto difieren (es decir, a
 * partir del 1 de enero siguiente al despliegue). `suppressHydrationWarning`
 * cubre el caso de un HTML estático generado en otro año.
 */
const FALLBACK_YEAR = 2026;

/** No hay nada a lo que suscribirse: el valor solo se comprueba al hidratar. */
const subscribe = () => () => {};
const getYear = () => new Date().getFullYear();
const getFallbackYear = () => FALLBACK_YEAR;

export function Year() {
  const year = useSyncExternalStore(subscribe, getYear, getFallbackYear);
  return <span suppressHydrationWarning>{year}</span>;
}
