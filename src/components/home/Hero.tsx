"use client";

import { Fragment, useState } from "react";
import Image from "next/image";
import { Pause, Play } from "lucide-react";
import { PHOTOS } from "@/content/site";
import { OpenStatus } from "@/components/ui/OpenStatus";

const photo = PHOTOS.fachada;

/** Divide un texto en palabras y letras con índice global `--i` para el escalonado del titular. */
function Letters({ text, start }: { text: string; start: number }) {
  const words = text.split(" ");
  let index = start;
  return (
    <>
      {words.map((word, w) => (
        <Fragment key={w}>
          <span className="hero-word">
            {Array.from(word).map((char, c) => {
              const style = { "--i": index } as React.CSSProperties;
              index += 1;
              return (
                <span key={c} className="hero-letter" style={style}>
                  {char}
                </span>
              );
            })}
          </span>
          {w < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </>
  );
}

/**
 * Splash de entrada: hiladas de sillar que se asientan una a una.
 * Solo se ve cuando <html> tiene `splash-play` (primera carga de "/" en la sesión,
 * ver `src/lib/splash.ts`). Sin JS o en visitas posteriores no se renderiza.
 * Vive FUERA de la sección del hero porque esta aísla su contexto de apilamiento
 * y el splash debe quedar por encima del header fijo.
 */
function Splash() {
  return (
    <div className="splash" aria-hidden="true">
      <div className="flex flex-col items-center gap-5">
        <svg viewBox="0 0 72 35" width="88" height="43" className="splash__wall">
          {/* Hilada inferior primero, como se levanta un muro */}
          <rect className="splash__block" style={{ "--b": 0 } as React.CSSProperties} x="0" y="19" width="16" height="16" />
          <rect className="splash__block" style={{ "--b": 1 } as React.CSSProperties} x="19" y="19" width="34" height="16" />
          <rect className="splash__block" style={{ "--b": 2 } as React.CSSProperties} x="56" y="19" width="16" height="16" />
          <rect className="splash__block" style={{ "--b": 3 } as React.CSSProperties} x="0" y="0" width="34" height="16" />
          <rect className="splash__block" style={{ "--b": 4 } as React.CSSProperties} x="37" y="0" width="35" height="16" />
        </svg>
        <p className="splash__label t-label t-label-light">Sabandía · Arequipa · 1621</p>
      </div>
    </div>
  );
}

/**
 * Portada al estilo del Guggenheim Bilbao: solo fotografía a sangre, el nombre
 * enorme arriba, el estado de apertura abajo a la izquierda y el control de
 * movimiento abajo a la derecha. Todo lo demás vive debajo del pliegue.
 *
 * Secuencia de entrada (solo con `html.splash-play`, todo en CSS; los tiempos
 * cuentan desde que la foto está lista, máx. 2,5 s de espera con el splash):
 *   0,0–1,7 s  splash con las hiladas de sillar, que se retira
 *   1,3–3,2 s  la fotografía aparece poco a poco (opacidad + escala)
 *   2,5–4,2 s  el nombre entra letra a letra
 *   3,4–4,3 s  header, estado y botón de pausa
 * Cualquier tecla salta la introducción.
 */
export function Hero() {
  const [paused, setPaused] = useState(false);

  return (
    <>
      <Splash />
      <section
        aria-label="Portada"
        data-paused={paused ? "true" : "false"}
        className="relative isolate h-[100svh] overflow-hidden bg-volcan-950 text-sillar-50"
      >
        <div aria-hidden="true" className="absolute inset-0 -z-10 overflow-hidden">
          <div className="hero-media absolute inset-0">
            <div className="kenburns absolute inset-0">
              <Image
                src={photo.src}
                alt=""
                fill
                priority
                sizes="(max-aspect-ratio: 4/3) 145vh, 100vw"
                className="hero-photo object-cover object-[50%_58%]"
              />
            </div>
          </div>
          <div className="hero-veil absolute inset-0" />
        </div>

        <div className="container-hero flex h-full flex-col pt-[calc(var(--header-h)+clamp(12px,5vh,64px))] pb-[clamp(20px,4.5vh,44px)]">
          <div className="hero-name-wrap">
            <h1 className="hero-name">
              <span className="sr-only">Molino de Sabandía</span>
              <span aria-hidden="true">
                <span className="hero-name__strong">
                  <Letters text="Molino" start={0} />
                </span>{" "}
                <span className="hero-name__light">
                  <Letters text="de Sabandía" start={6} />
                </span>
              </span>
            </h1>
          </div>

          <div data-intro="ui" className="mt-auto flex items-end justify-between gap-4">
            <OpenStatus tone="plain" />
            <button
              type="button"
              onClick={() => setPaused((v) => !v)}
              className="inline-flex size-12 shrink-0 items-center justify-center rounded-full border border-sillar-50/75 text-sillar-50 transition-colors duration-300 hover:bg-sillar-50 hover:text-volcan-950 md:size-14"
            >
              <span className="sr-only">{paused ? "Reanudar movimiento" : "Pausar movimiento"}</span>
              {paused ? (
                <Play size={18} strokeWidth={1.4} aria-hidden="true" />
              ) : (
                <Pause size={18} strokeWidth={1.4} aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
