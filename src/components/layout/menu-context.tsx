"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

type MenuContextValue = {
  open: boolean;
  openMenu: () => void;
  closeMenu: () => void;
  toggleMenu: () => void;
};

const MenuContext = createContext<MenuContextValue | null>(null);

export function MenuProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const openMenu = useCallback(() => setOpen(true), []);
  const closeMenu = useCallback(() => setOpen(false), []);
  const toggleMenu = useCallback(() => setOpen((v) => !v), []);
  const value = useMemo(() => ({ open, openMenu, closeMenu, toggleMenu }), [open, openMenu, closeMenu, toggleMenu]);
  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
}

/** Estado del menú overlay. Debe usarse dentro de `Providers`. */
export function useMenu(): MenuContextValue {
  const ctx = useContext(MenuContext);
  if (!ctx) throw new Error("useMenu() debe usarse dentro de <Providers>.");
  return ctx;
}
