import { describe, expect, it } from "vitest"

import { WIDGET_PRESET_IDS } from "@/lib/widget/types"

import {
  absoluteSiteUrl,
  APP_PATHS,
  createLandingMetadata,
  INDEXABLE_PATHS,
  PRESET_PATHS,
  SOCIAL_IMAGE,
  SITE_LAST_MODIFIED,
  SITE_PATHS,
  presetPath,
} from "./site-metadata"

describe("indexable routes", () => {
  it("contains every canonical public page exactly once", () => {
    const paths = [...INDEXABLE_PATHS]

    expect(new Set(paths)).toEqual(
      new Set([...Object.values(SITE_PATHS), APP_PATHS.builder, ...PRESET_PATHS]),
    )
    expect(new Set(paths).size).toBe(paths.length)
  })

  it("includes a landing page for every widget preset", () => {
    expect(PRESET_PATHS).toEqual(WIDGET_PRESET_IDS.map((id) => presetPath(id)))
    for (const path of PRESET_PATHS) {
      expect(INDEXABLE_PATHS).toContain(path)
    }
  })

  it("keeps the generated widget route outside the indexable sitemap", () => {
    expect([...INDEXABLE_PATHS]).not.toContain(APP_PATHS.widget)
  })

  it("generates absolute HTTPS URLs for the sitemap", () => {
    expect(INDEXABLE_PATHS.map(absoluteSiteUrl)).toEqual([
      "https://faceitwidget.com/",
      "https://faceitwidget.com/builder/",
      "https://faceitwidget.com/faceit-widget-obs/",
      "https://faceitwidget.com/faceit-widget-streamlabs/",
      "https://faceitwidget.com/live-faceit-stats/",
      "https://faceitwidget.com/presets/",
      "https://faceitwidget.com/presets/elo-pill/",
      "https://faceitwidget.com/presets/rank-elo/",
      "https://faceitwidget.com/presets/rank-country/",
      "https://faceitwidget.com/presets/compact/",
      "https://faceitwidget.com/presets/today-stats/",
      "https://faceitwidget.com/presets/rich-profile/",
      "https://faceitwidget.com/presets/profile-card/",
      "https://faceitwidget.com/presets/performance-card/",
      "https://faceitwidget.com/about/",
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

  it("keeps structured-data freshness tied to an explicit ISO date", () => {
    expect(SITE_LAST_MODIFIED).toMatch(/^20\d{2}-\d{2}-\d{2}$/)
  })
})
