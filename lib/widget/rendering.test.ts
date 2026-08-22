import { describe, expect, it } from "vitest"

import { getWidgetZoom, OBS_OUTPUT_SCALE } from "./rendering"

describe("getWidgetZoom", () => {
  it("preserves the configured size in previews", () => {
    expect(getWidgetZoom(1.25)).toBe(1.25)
  })

  it("renders OBS output at a higher native resolution", () => {
    expect(getWidgetZoom(1, OBS_OUTPUT_SCALE)).toBe(1.5)
  })
})
