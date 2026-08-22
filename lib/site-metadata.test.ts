import { describe, expect, it } from "vitest"

import {
  absoluteSiteUrl,
  createLandingMetadata,
  INDEXABLE_PATHS,
  SOCIAL_IMAGE,
  SITE_PATHS,
} from "./site-metadata"

describe("indexable routes", () => {
  it("contains every canonical landing exactly once", () => {
    const paths = [...INDEXABLE_PATHS]

    expect(paths).toEqual(Object.values(SITE_PATHS))
    expect(new Set(paths).size).toBe(paths.length)
  })

  it("generates absolute HTTPS URLs for the sitemap", () => {
    expect(INDEXABLE_PATHS.map(absoluteSiteUrl)).toEqual([
      "https://faceitwidget.com/",
      "https://faceitwidget.com/faceit-widget-obs/",
      "https://faceitwidget.com/live-faceit-stats/",
      "https://faceitwidget.com/contact/",
      "https://faceitwidget.com/privacy/",
    ])
  })

  it("keeps canonical and social URLs aligned for a landing page", () => {
    const metadata = createLandingMetadata({
      title: "Example guide",
      description: "Example description",
      path: SITE_PATHS.faceitWidgetObsGuide,
    })

    const canonical = "https://faceitwidget.com/faceit-widget-obs/"
    expect(metadata.alternates?.canonical).toBe(canonical)
    expect(metadata.openGraph?.url).toBe(canonical)
    expect(metadata.openGraph?.title).toBe("Example guide | FACEIT Widget")
    expect(metadata.openGraph?.images).toEqual([SOCIAL_IMAGE])
    expect(metadata.twitter?.images).toEqual([SOCIAL_IMAGE.url])
  })
})
