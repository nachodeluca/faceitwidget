import type { MetadataRoute } from "next"

import { absoluteSiteUrl, INDEXABLE_ROUTES } from "@/lib/site-metadata"

export const dynamic = "force-static"

export default function sitemap(): MetadataRoute.Sitemap {
  return INDEXABLE_ROUTES.map(({ path, changeFrequency, priority }) => ({
    url: absoluteSiteUrl(path),
    changeFrequency,
    priority,
  }))
}
