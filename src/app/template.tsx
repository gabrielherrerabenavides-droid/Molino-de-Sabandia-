"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { EASE } from "@/components/ui/Reveal";

/**
 * Transición entre páginas (DESIGN.md §5). El header vive en el layout, así que
 * no parpadea. `prefers-reduced-motion` se respeta vía `MotionConfig` en `Providers`.
 *
 * La PRIMERA carga no se anima: si lo hiciera, Motion serializaría
 * `opacity:0` como estilo en línea en el HTML prerenderizado y toda la página
 * quedaría invisible hasta que el navegador descargara, parseara e hidratara el
 * árbol cliente (y en blanco sin JS). `clientHasMounted` vive en el módulo y
 * solo se consulta en el cliente: en el servidor siempre vale `initial={false}`,
 * de modo que el markup servido nunca oculta el contenido y la hidratación
 * coincide con él.
 * En las navegaciones posteriores Next monta un `Template` nuevo, ya con la
 * bandera puesta, y el fundido de 0,45 s sí se ejecuta.
 */
let clientHasMounted = false;

export default function Template({ children }: { children: React.ReactNode }) {
  // Inicializador perezoso: en el servidor siempre `false`, y en la primera
  // hidratación también, así que el markup coincide.
  const [animateEntrance] = useState(() => typeof window !== "undefined" && clientHasMounted);

  useEffect(() => {
    clientHasMounted = true;
  }, []);

  return (
    <motion.div
      initial={animateEntrance ? { opacity: 0, y: 12 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}
