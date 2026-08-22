import type { MetadataRoute } from "next"

import { SITE_METADATA } from "@/lib/site-metadata"

export const dynamic = "force-static"

const AI_DISCOVERY_CRAWLERS = [
  "OAI-SearchBot",
  "Googlebot",
  "Google-Extended",
  "bingbot",
  "Claude-SearchBot",
  "PerplexityBot",
  "Applebot",
] as const

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: "/api/",
      },
      {
        userAgent: [...AI_DISCOVERY_CRAWLERS],
        allow: "/",
        disallow: "/api/",
      },
    ],
    sitemap: `${SITE_METADATA.url}/sitemap.xml`,
  }
}
