"use client";

import { MotionConfig } from "motion/react";
import { MenuProvider, useMenu } from "@/components/layout/menu-context";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { MenuOverlay } from "@/components/layout/MenuOverlay";

export { useMenu };

/**
 * Contexto de menú, scroll suave y overlay de navegación.
 *
 * Sin banner de cookies: el sitio no instala cookies no esenciales ni scripts
 * de terceros, y la normativa peruana (Ley 29733 y su reglamento) no exige un
 * aviso de consentimiento previo para el almacenamiento estrictamente técnico.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <MenuProvider>
        <a href="#contenido" className="skip-link">
          Saltar al contenido
        </a>
        <SmoothScroll />
        {children}
        <MenuOverlay />
      </MenuProvider>
    </MotionConfig>
  );
}
