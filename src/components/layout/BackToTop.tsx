"use client";

import { ArrowUp } from "lucide-react";
import { smoothScrollTo } from "@/components/layout/SmoothScroll";

export function BackToTop({ className }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => smoothScrollTo(0)}
      className={className}
    >
      <ArrowUp aria-hidden="true" size={15} strokeWidth={1.5} />
      <span className="link-line">Volver arriba</span>
    </button>
  );
}
