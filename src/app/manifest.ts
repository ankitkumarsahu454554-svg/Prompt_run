import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Broke But Functional — Survive the Month",
    short_name: "BrokeApp",
    description: "Personal finance survival experience for surviving the month on a fixed budget.",
    start_url: "/",
    display: "standalone",
    background_color: "#090a0f",
    theme_color: "#6366f1",
    icons: [
      {
        src: "/icon-192.svg",
        sizes: "192x192",
        type: "image/svg+xml",
      },
      {
        src: "/icon-512.svg",
        sizes: "512x512",
        type: "image/svg+xml",
      },
    ],
  };
}
