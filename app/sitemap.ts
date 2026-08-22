import type { MetadataRoute } from "next"

import { absoluteSiteUrl, INDEXABLE_PATHS } from "@/lib/site-metadata"

export const dynamic = "force-static"

export default function sitemap(): MetadataRoute.Sitemap {
  return INDEXABLE_PATHS.map((path) => ({ url: absoluteSiteUrl(path) }))
}
