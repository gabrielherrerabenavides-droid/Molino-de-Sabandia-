/**
 * Esqueleto sobrio mientras carga el asistente de reservas (sin spinners).
 * Vive en el grupo `(asistente)` a propósito: si estuviera en `/reservas` envolvería
 * también `/reservas/[token]` en un Suspense, la cabecera se enviaría antes de
 * resolver el token y un enlace inválido respondería 200 en vez de 404.
 */
export default function LoadingReservas() {
  return (
    <div className="pt-[calc(var(--header-h)+clamp(40px,8vw,120px))]" aria-busy="true">
      <div className="container-site pb-[clamp(72px,10vw,160px)]">
        <div className="h-3 w-28 bg-sillar-200" />
        <div className="mt-6 h-[clamp(2.4rem,4.5vw,4rem)] w-full max-w-[16ch] bg-sillar-200" />
        <div className="mt-6 h-4 w-full max-w-prose-narrow bg-sillar-100" />
        <div className="mt-2 h-4 w-2/3 max-w-prose-narrow bg-sillar-100" />

        <div className="mt-[clamp(40px,6vw,88px)] grid grid-cols-2 gap-6 sm:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i}>
              <hr className="stone-rule" />
              <div className="mt-2 h-3 w-24 bg-sillar-200" />
            </div>
          ))}
        </div>

        <div className="mt-14 grid gap-px sm:grid-cols-2">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="min-h-[132px] border border-sillar-200 bg-white/40" />
          ))}
        </div>
        <span className="sr-only">Cargando el formulario de reservas…</span>
      </div>
    </div>
  );
}
