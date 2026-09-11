import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";
import { Words } from "@/components/ui/Words";

export function Manifiesto() {
  return (
    <section aria-labelledby="manifiesto" className="border-y border-sillar-200 bg-sillar-100">
      <div className="container-site section">
        <Reveal>
          <Eyebrow tone="ocre" className="mb-7">
            Un lugar, muchas historias
          </Eyebrow>
        </Reveal>
        <h2 id="manifiesto" className="t-display max-w-[24ch]">
          <Words lines={["La fuerza del agua.", "La calma de la campiña."]} stagger={0.045} y={28} />
        </h2>
        <Reveal delay={0.15} className="mt-[clamp(24px,3vw,44px)] grid gap-6 md:grid-cols-2 md:gap-[clamp(28px,4vw,72px)]">
          <p className="t-lead max-w-prose-narrow">
            El molino no es una ruina bonita: es una máquina que todavía funciona. El manantial de Sabandía baja por
            el canal, mueve la rueda y las piedras convierten el maíz en harina delante de ti.
          </p>
          <div className="self-end">
            <hr className="stone-rule w-12" />
            <p className="max-w-prose-narrow mt-5 text-[1.05rem] leading-relaxed text-muted">
              Alrededor, cuatro siglos de sillar, jardines, acequias y animales de la sierra. Los vecinos siguen
              trayendo sus sacos y el Misti sigue mirando desde el fondo. Nada de esto se detuvo; solo aprendió a
              esperar a quien quiera mirarlo con calma.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
