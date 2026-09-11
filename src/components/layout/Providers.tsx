"use client";

import { MotionConfig } from "motion/react";
import { MenuProvider, useMenu } from "@/components/layout/menu-context";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { MenuOverlay } from "@/components/layout/MenuOverlay";
import { CookieBanner } from "@/components/layout/CookieBanner";

export { useMenu };

/** Contexto de menú, scroll suave, overlay de navegación y aviso de cookies. */
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
        <CookieBanner />
      </MenuProvider>
    </MotionConfig>
  );
}
