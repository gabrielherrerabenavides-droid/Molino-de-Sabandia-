import type { MetadataRoute } from "next";
import { SITE } from "@/content/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE.name,
    short_name: "Molino de Sabandía",
    description: SITE.description,
    start_url: "/",
    display: "standalone",
    background_color: "#f7f5ef",
    theme_color: "#f7f5ef",
    icons: [{ src: "/icon.svg", type: "image/svg+xml", sizes: "any" }],
  };
}
