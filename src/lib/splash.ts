/**
 * Script en línea que decide, ANTES del primer pintado, si se reproduce el splash
 * de la portada. Se inserta al principio de <body> en el layout raíz.
 *
 *  - Solo en la primera carga completa de "/" de la sesión (sessionStorage).
 *  - Nunca con `prefers-reduced-motion` ni si sessionStorage no está disponible.
 *  - `?splash=1` lo fuerza (útil para revisar la animación).
 *  - Sin JS no hay clases, así que el contenido se ve directamente.
 *
 * Clases en <html> (el CSS vive al final de globals.css):
 *  - `splash-hold`: el splash espera a que la foto de portada cargue (evento
 *    load/error de img.hero-photo, capturado en document), como máximo
 *    SPLASH_HOLD_MAX_MS. Así el nombre nunca aparece sobre negro sin foto.
 *  - `splash-lock`: sin scroll hasta SPLASH_LOCK_MS después de arrancar.
 *  - `splash-play`: se retira a SPLASH_TOTAL_MS; los elementos quedan en su estado
 *    final (fill-mode both), así que no hay salto.
 *  - `photo-late`: la foto llegó después de agotar la espera; entra con fundido.
 *  - `name-wait`: oculta el nombre visual hasta que carga Archivo (máx. 3 s),
 *    porque la fuente de reserva es más estrecha y el nombre "crecería".
 * Cualquier tecla salta la introducción (accesibilidad: el foco nunca cae en
 * controles invisibles). Una navegación interna también la cancela
 * (SmoothScroll.tsx).
 */
export const SPLASH_HOLD_MAX_MS = 2500;
export const SPLASH_LOCK_MS = 1700;
export const SPLASH_TOTAL_MS = 4700;

export const SPLASH_CLASSES = ["splash-play", "splash-lock", "splash-hold", "photo-late"] as const;

export const SPLASH_SCRIPT = `(function(){var d=document.documentElement,c=d.classList;
try{if(location.pathname==="/"&&document.fonts){var fam=getComputedStyle(d).getPropertyValue("--font-archivo").trim();if(fam&&!document.fonts.check("700 16px "+fam)){c.add("name-wait");var u=function(){c.remove("name-wait")};document.fonts.load("700 16px "+fam).then(u,u);setTimeout(u,3000)}}}catch(e){}
try{var s=window.sessionStorage,k="msb-splash";var force=/[?&]splash=1/.test(location.search);var seen=s.getItem(k);s.setItem(k,"1");if(!force&&(seen||location.pathname!=="/"))return;if(window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;
c.add("splash-play","splash-lock","splash-hold");var started=false,done=false;
var end=function(){done=true;c.remove("splash-play","splash-lock","splash-hold","photo-late")};
var go=function(){if(started||done)return;started=true;c.remove("splash-hold");setTimeout(function(){c.remove("splash-lock")},${SPLASH_LOCK_MS});setTimeout(function(){if(!done)end()},${SPLASH_TOTAL_MS})};
var hit=function(e){var t=e.target;if(t&&t.classList&&t.classList.contains("hero-photo")){if(started&&!done&&e.type==="load")c.add("photo-late");go()}};
document.addEventListener("load",hit,true);document.addEventListener("error",hit,true);
document.addEventListener("DOMContentLoaded",function(){var i=document.querySelector("img.hero-photo");if(i&&i.complete&&i.naturalWidth)go()});
setTimeout(go,${SPLASH_HOLD_MAX_MS});
document.addEventListener("keydown",end,{once:true});}catch(e){}})();`;
