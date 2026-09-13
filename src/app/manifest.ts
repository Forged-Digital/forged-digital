import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Forged Digital Client Portal",
    short_name: "Forged Digital",
    description: "Forged Digital client portal",
    start_url: "/portal",
    display: "standalone",
    background_color: "#070808",
    theme_color: "#070808",
    icons: [{ src: "/assets/forged-logo-mark.webp", sizes: "512x512", type: "image/webp" }],
  };
}
