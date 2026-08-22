import type { MetadataRoute } from "next"

import { SITE_METADATA } from "@/lib/site-metadata"

export const dynamic = "force-static"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_METADATA.name,
    short_name: SITE_METADATA.name,
    description: SITE_METADATA.description,
    start_url: "/",
    display: "standalone",
    background_color: "#121212",
    theme_color: "#121212",
    icons: [
      {
        src: "/logo.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  }
}
