import { describe, expect, it } from "vitest"

import { WIDGET_BACKDROPS } from "./registry"
import { WIDGET_BACKDROP_IDS } from "./types"

describe("widget backdrop registry", () => {
  it("keeps the asset registry aligned with serializable backdrop IDs", () => {
    expect(WIDGET_BACKDROPS.map(({ id }) => id)).toEqual(WIDGET_BACKDROP_IDS)
  })

  it("provides local media for every selectable backdrop", () => {
    expect(WIDGET_BACKDROPS.slice(1).every(({ media, src, posterSrc }) => media === "video" && src && posterSrc)).toBe(true)
  })
})
