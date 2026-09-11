"use client";

import { useId, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal, RevealItem } from "@/components/ui/Reveal";
import { WaterLine } from "@/components/textures/WaterLine";

const STEPS = [
  {
    num: "01",
    title: "Agua",
    text: "El manantial de Sabandía baja por un canal de sillar. Solo gravedad: ni motor, ni electricidad.",
  },
  {
    num: "02",
    title: "Movimiento",
    text: "El agua cae sobre los álabes de la rueda y la hace girar. El eje transmite el giro hacia dentro del molino.",
  },
  {
    num: "03",
    title: "Molienda",
    text: "Dos piedras, una fija y otra girando, abren el grano y lo convierten en harina de trigo, maíz o cebada.",
  },
] as const;

const SPOKES = Array.from({ length: 12 }, (_, i) => (i * 360) / 12);
const FURROWS = Array.from({ length: 8 }, (_, i) => (i * 360) / 8);

export function Agua() {
  const reduced = useReducedMotion();
  const [speed, setSpeed] = useState(1);
  const sliderId = useId();

  const wheelDuration = 18 / speed;
  const stoneDuration = 26 / speed;
  const waterDuration = 7 / speed;

  return (
    <section id="agua" aria-labelledby="agua-title" className="sillar-pattern border-y border-sillar-200">
      <WaterLine className="h-[clamp(56px,7vw,96px)] pt-4" />

      <div className="container-site pb-[clamp(56px,8vw,120px)]">
        <div className="grid items-end gap-8 lg:grid-cols-[1fr_auto]">
          <Reveal>
            <Eyebrow tone="ocre" className="mb-5">
              Cómo funciona
            </Eyebrow>
            <h2 id="agua-title" className="t-display max-w-[20ch]">
              El corazón del molino
            </h2>
          </Reveal>
          <Reveal delay={0.1} className="max-w-none lg:w-[280px]">
            <label htmlFor={sliderId} className="t-label block">
              Explora el movimiento
            </label>
            <input
              id={sliderId}
              type="range"
              min={0.4}
              max={2}
              step={0.1}
              value={speed}
              onChange={(event) => setSpeed(Number(event.target.value))}
              className="range mt-4"
              aria-valuetext={`${speed.toFixed(1)} veces la velocidad normal`}
            />
            <p className="t-label mt-3">Velocidad · {speed.toFixed(1)}×</p>
          </Reveal>
        </div>

        <Reveal className="mt-[clamp(28px,4vw,56px)] max-w-none">
          <svg
            viewBox="0 0 880 400"
            role="img"
            aria-label="Esquema del principio hidráulico: el canal lleva el agua a la rueda, la rueda gira y el eje mueve la piedra de moler."
            className="h-auto w-full"
            fill="none"
          >
            {/* Canal de sillar */}
            <g stroke="var(--color-volcan-700)" strokeWidth="1.5">
              <path d="M8 52H300l44 56" />
              <path d="M8 104H286l58 74" strokeOpacity="0.55" />
              <path d="M40 52v52M80 52v52M120 52v52M160 52v52M200 52v52M240 52v52" strokeOpacity="0.18" />
            </g>

            {/* Agua en movimiento */}
            <motion.path
              d="M18 78H292c14 0 20 12 28 24l40 52"
              stroke="var(--color-agua-500)"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray="26 34"
              initial={{ strokeDashoffset: 0 }}
              animate={reduced ? { strokeDashoffset: 0 } : { strokeDashoffset: -240 }}
              transition={reduced ? { duration: 0 } : { duration: waterDuration, repeat: Infinity, ease: "linear" }}
            />
            <path d="M18 78H292c14 0 20 12 28 24l40 52" stroke="var(--color-agua-500)" strokeOpacity="0.18" strokeWidth="5" strokeLinecap="round" />

            {/* Canal de salida: el agua deja la rueda */}
            <path d="M400 352H18" stroke="var(--color-agua-500)" strokeOpacity="0.18" strokeWidth="5" strokeLinecap="round" />
            <motion.path
              d="M400 352H18"
              stroke="var(--color-agua-500)"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray="22 40"
              initial={{ strokeDashoffset: 0 }}
              animate={reduced ? { strokeDashoffset: 0 } : { strokeDashoffset: -248 }}
              transition={reduced ? { duration: 0 } : { duration: waterDuration * 1.3, repeat: Infinity, ease: "linear" }}
            />
            <g stroke="var(--color-volcan-700)" strokeWidth="1.5" strokeOpacity="0.55">
              <path d="M8 330h392M8 372h330" />
            </g>

            {/* Rueda hidráulica */}
            <g>
              <motion.g
                style={{ transformBox: "fill-box" }}
                animate={reduced ? { rotate: 0 } : { rotate: 360 }}
                transition={reduced ? { duration: 0 } : { duration: wheelDuration, repeat: Infinity, ease: "linear" }}
              >
                <circle cx="430" cy="230" r="112" stroke="var(--color-volcan-700)" strokeWidth="2" />
                <circle cx="430" cy="230" r="96" stroke="var(--color-volcan-700)" strokeWidth="1" strokeOpacity="0.4" />
                <circle cx="430" cy="230" r="26" stroke="var(--color-volcan-700)" strokeWidth="2" />
                {SPOKES.map((angle) => (
                  <g key={angle} transform={`rotate(${angle} 430 230)`}>
                    <line x1="430" y1="204" x2="430" y2="118" stroke="var(--color-volcan-700)" strokeWidth="1.4" strokeOpacity="0.5" />
                    <line x1="430" y1="118" x2="430" y2="102" stroke="var(--color-agua-500)" strokeWidth="7" strokeLinecap="butt" />
                  </g>
                ))}
              </motion.g>
            </g>

            {/* Eje de transmisión */}
            <g stroke="var(--color-volcan-700)">
              <line x1="456" y1="230" x2="676" y2="230" strokeWidth="4" />
              <line x1="540" y1="214" x2="540" y2="246" strokeWidth="1.5" strokeOpacity="0.5" />
              <line x1="600" y1="214" x2="600" y2="246" strokeWidth="1.5" strokeOpacity="0.5" />
            </g>

            {/* Tolva */}
            <g stroke="var(--color-volcan-700)" strokeWidth="1.5">
              <path d="M700 92h112l-34 50h-44z" />
              <path d="M752 142v26" strokeDasharray="4 6" />
            </g>

            {/* Piedras de moler */}
            <g>
              <motion.g
                style={{ transformBox: "fill-box" }}
                animate={reduced ? { rotate: 0 } : { rotate: -360 }}
                transition={reduced ? { duration: 0 } : { duration: stoneDuration, repeat: Infinity, ease: "linear" }}
              >
                <circle cx="752" cy="230" r="62" fill="var(--color-sillar-200)" stroke="var(--color-volcan-700)" strokeWidth="2" />
                {FURROWS.map((angle) => (
                  <line
                    key={angle}
                    x1="752"
                    y1="230"
                    x2="752"
                    y2="168"
                    transform={`rotate(${angle} 752 230)`}
                    stroke="var(--color-volcan-700)"
                    strokeWidth="1.2"
                    strokeOpacity="0.45"
                  />
                ))}
                <circle cx="752" cy="230" r="9" fill="var(--color-sillar-50)" stroke="var(--color-volcan-700)" strokeWidth="1.5" />
              </motion.g>
              <circle cx="752" cy="230" r="78" stroke="var(--color-volcan-700)" strokeWidth="1" strokeOpacity="0.35" />
              <path d="M674 318h156" stroke="var(--color-volcan-700)" strokeWidth="1.5" />
              <path d="M712 318c10-16 26-22 40-22s30 6 40 22z" fill="var(--color-ocre-300)" fillOpacity="0.5" stroke="var(--color-ocre-500)" strokeWidth="1" />
            </g>

            {/* Marcas 01 · 02 · 03 */}
            <g fill="var(--color-ocre-500)" fontSize="15" letterSpacing="2.4" fontWeight="500">
              <text x="18" y="34">01</text>
              <text x="418" y="396">02</text>
              <text x="740" y="396">03</text>
            </g>
            <g stroke="var(--color-ocre-500)" strokeWidth="1" strokeOpacity="0.45">
              <path d="M24 44v6M432 380v-16M754 380v-42" />
            </g>
          </svg>
        </Reveal>

        <p className="t-label mt-4">Esquema explicativo del principio hidráulico.</p>

        <Reveal stagger={0.1} as="ul" className="mt-[clamp(32px,4vw,64px)] grid gap-0 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <RevealItem
              as="li"
              key={step.num}
              className={index > 0 ? "border-t border-sillar-200 pt-6 md:border-t-0 md:border-l md:pt-0 md:pl-[clamp(20px,3vw,44px)]" : "pt-6 md:pt-0"}
            >
              <p className="t-label-ocre">{step.num}</p>
              <h3 className="t-h3 mt-3">{step.title}</h3>
              <p className="t-body max-w-prose-narrow mt-3 pb-6 text-volcan-700 md:pb-0 md:pr-[clamp(16px,2vw,32px)]">{step.text}</p>
            </RevealItem>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
