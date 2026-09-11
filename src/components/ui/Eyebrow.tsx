import { clsx } from "clsx";

/** Etiqueta corta sobre un titular (DESIGN.md §3). */
export function Eyebrow({
  children,
  tone = "muted",
  className,
}: {
  children: React.ReactNode;
  tone?: "muted" | "ocre" | "light";
  className?: string;
}) {
  return (
    <p
      className={clsx(
        tone === "ocre" ? "t-label-ocre" : "t-label",
        tone === "light" && "t-label-light",
        className,
      )}
    >
      {children}
    </p>
  );
}
