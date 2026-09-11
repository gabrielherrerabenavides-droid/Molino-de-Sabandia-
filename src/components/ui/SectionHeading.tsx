import { clsx } from "clsx";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";

/** Cabecera de sección: eyebrow + titular + lead, con reveal al entrar. */
export function SectionHeading({
  eyebrow,
  title,
  lead,
  tone = "ink",
  level = "h2",
  id,
  className,
  titleClassName,
  children,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  lead?: React.ReactNode;
  tone?: "ink" | "light";
  level?: "h2" | "h3";
  id?: string;
  className?: string;
  titleClassName?: string;
  children?: React.ReactNode;
}) {
  const dark = tone === "light";
  const Tag = level;
  return (
    <Reveal className={clsx("max-w-[38ch]", className)}>
      {eyebrow && (
        <Eyebrow tone={dark ? "light" : "ocre"} className="mb-5">
          {eyebrow}
        </Eyebrow>
      )}
      <Tag id={id} className={clsx("t-display", dark && "text-sillar-50", titleClassName)}>
        {title}
      </Tag>
      {lead && <p className={clsx("t-lead max-w-prose-narrow mt-6", dark && "t-lead-light")}>{lead}</p>}
      {children}
    </Reveal>
  );
}
