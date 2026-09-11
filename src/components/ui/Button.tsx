import Link from "next/link";
import { clsx } from "clsx";
import type { ComponentProps } from "react";

type Variant = "primary" | "light" | "ghost" | "ghost-light";
const variantClass: Record<Variant, string> = {
  primary: "btn-primary", light: "btn-light", ghost: "btn-ghost", "ghost-light": "btn-ghost-light",
};

type Size = "md" | "sm";
const sizeClass: Record<Size, string> = { md: "", sm: "btn-sm" };

type ButtonProps = ComponentProps<"button"> & { variant?: Variant; size?: Size; href?: undefined };
type LinkProps = Omit<ComponentProps<typeof Link>, "href"> & { variant?: Variant; size?: Size; href: string };

export function Button(props: ButtonProps | LinkProps) {
  const { variant = "primary", size = "md", className, ...rest } = props;
  const cls = clsx("btn", variantClass[variant], sizeClass[size], className);
  if ("href" in rest && typeof rest.href === "string") {
    const { href, ...linkRest } = rest as LinkProps;
    return <Link href={href} className={cls} {...linkRest} />;
  }
  return <button className={cls} {...(rest as ButtonProps)} />;
}
