"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Accessibility,
  CaseSensitive,
  Eye,
  Link2,
  Minus,
  Pause,
  Plus,
  RotateCcw,
  Type,
  X,
} from "lucide-react";

const STORAGE_KEY = "molino-accessibility";
const TEXT_SCALES = [100, 112, 125, 150] as const;

type Preferences = {
  textScale: (typeof TEXT_SCALES)[number];
  highContrast: boolean;
  underlineLinks: boolean;
  readableFont: boolean;
  reduceMotion: boolean;
};

const DEFAULTS: Preferences = {
  textScale: 100,
  highContrast: false,
  underlineLinks: false,
  readableFont: false,
  reduceMotion: false,
};

function isPreferences(value: unknown): value is Preferences {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<Preferences>;
  return (
    TEXT_SCALES.includes(candidate.textScale as Preferences["textScale"]) &&
    typeof candidate.highContrast === "boolean" &&
    typeof candidate.underlineLinks === "boolean" &&
    typeof candidate.readableFont === "boolean" &&
    typeof candidate.reduceMotion === "boolean"
  );
}

function applyPreferences(preferences: Preferences) {
  const root = document.documentElement;
  root.dataset.a11yText = String(preferences.textScale);
  root.classList.toggle("a11y-high-contrast", preferences.highContrast);
  root.classList.toggle("a11y-underline-links", preferences.underlineLinks);
  root.classList.toggle("a11y-readable-font", preferences.readableFont);
  root.classList.toggle("a11y-reduce-motion", preferences.reduceMotion);
}

export function AccessibilityTools() {
  const [open, setOpen] = useState(false);
  const [preferences, setPreferences] = useState<Preferences>(() => {
    if (typeof window === "undefined") return DEFAULTS;
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (!saved) return DEFAULTS;
      const parsed: unknown = JSON.parse(saved);
      return isPreferences(parsed) ? parsed : DEFAULTS;
    } catch {
      return DEFAULTS;
    }
  });
  const panelRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    applyPreferences(preferences);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    } catch {
      // Preferencias de sesión solamente si el almacenamiento no está disponible.
    }
  }, [preferences]);

  const close = useCallback((restoreFocus = true) => {
    setOpen(false);
    if (restoreFocus) window.requestAnimationFrame(() => triggerRef.current?.focus());
  }, []);

  useEffect(() => {
    if (!open) return;
    const firstControl = panelRef.current?.querySelector<HTMLElement>("button");
    window.requestAnimationFrame(() => firstControl?.focus());

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!panelRef.current?.contains(target) && !triggerRef.current?.contains(target)) close(false);
    };
    window.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open, close]);

  const changeScale = (direction: -1 | 1) => {
    setPreferences((current) => {
      const index = TEXT_SCALES.indexOf(current.textScale);
      const nextIndex = Math.min(TEXT_SCALES.length - 1, Math.max(0, index + direction));
      return { ...current, textScale: TEXT_SCALES[nextIndex] };
    });
  };

  const toggle = (key: keyof Omit<Preferences, "textScale">) => {
    setPreferences((current) => ({ ...current, [key]: !current[key] }));
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label="Abrir herramientas de accesibilidad"
        aria-expanded={open}
        aria-controls="herramientas-accesibilidad"
        onClick={() => setOpen((value) => !value)}
        className="a11y-trigger"
      >
        <Accessibility size={22} strokeWidth={1.7} aria-hidden="true" />
      </button>

      {open && (
        <aside
          ref={panelRef}
          id="herramientas-accesibilidad"
          role="dialog"
          aria-modal="false"
          aria-labelledby="a11y-title"
          data-lenis-prevent
          className="a11y-panel"
        >
          <div className="flex items-start justify-between gap-5 border-b border-sillar-200 px-5 py-4">
            <div>
              <p className="t-label text-ocre-500">Preferencias</p>
              <h2 id="a11y-title" className="mt-1 text-lg font-semibold leading-tight">
                Accesibilidad
              </h2>
            </div>
            <button type="button" onClick={() => close()} className="a11y-icon-button" aria-label="Cerrar herramientas de accesibilidad">
              <X size={19} aria-hidden="true" />
            </button>
          </div>

          <div className="space-y-2 p-3">
            <div className="a11y-row">
              <span className="flex min-w-0 items-center gap-3">
                <Type size={19} strokeWidth={1.6} aria-hidden="true" />
                <span className="font-medium">Tamaño del texto</span>
              </span>
              <span className="flex items-center gap-1">
                <button
                  type="button"
                  className="a11y-icon-button"
                  onClick={() => changeScale(-1)}
                  disabled={preferences.textScale === TEXT_SCALES[0]}
                  aria-label="Disminuir tamaño del texto"
                >
                  <Minus size={17} aria-hidden="true" />
                </button>
                <output className="w-12 text-center text-sm font-semibold tabular-nums" aria-live="polite">
                  {preferences.textScale}%
                </output>
                <button
                  type="button"
                  className="a11y-icon-button"
                  onClick={() => changeScale(1)}
                  disabled={preferences.textScale === TEXT_SCALES[TEXT_SCALES.length - 1]}
                  aria-label="Aumentar tamaño del texto"
                >
                  <Plus size={17} aria-hidden="true" />
                </button>
              </span>
            </div>

            <PreferenceButton
              icon={Eye}
              label="Alto contraste"
              active={preferences.highContrast}
              onClick={() => toggle("highContrast")}
            />
            <PreferenceButton
              icon={Link2}
              label="Subrayar enlaces"
              active={preferences.underlineLinks}
              onClick={() => toggle("underlineLinks")}
            />
            <PreferenceButton
              icon={CaseSensitive}
              label="Fuente legible"
              active={preferences.readableFont}
              onClick={() => toggle("readableFont")}
            />
            <PreferenceButton
              icon={Pause}
              label="Reducir movimiento"
              active={preferences.reduceMotion}
              onClick={() => toggle("reduceMotion")}
            />
          </div>

          <div className="border-t border-sillar-200 p-3">
            <button
              type="button"
              onClick={() => setPreferences(DEFAULTS)}
              className="flex min-h-11 w-full items-center justify-center gap-2 border border-sillar-300 px-4 text-sm font-medium transition-colors hover:bg-sillar-100"
            >
              <RotateCcw size={17} strokeWidth={1.6} aria-hidden="true" />
              Restablecer
            </button>
          </div>
        </aside>
      )}
    </>
  );
}

function PreferenceButton({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: typeof Eye;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button type="button" onClick={onClick} aria-pressed={active} className="a11y-row w-full text-left">
      <span className="flex min-w-0 items-center gap-3">
        <Icon size={19} strokeWidth={1.6} aria-hidden="true" />
        <span className="font-medium">{label}</span>
      </span>
      <span className="a11y-switch" aria-hidden="true">
        <span />
      </span>
    </button>
  );
}
