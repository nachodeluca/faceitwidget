import { describe, expect, it } from "vitest"

import { createDefaultConfig, normalizeConfig } from "./config"

describe("widget backdrop configuration", () => {
  it("defaults to no backdrop centered in the widget", () => {
    expect(createDefaultConfig().backdrop).toEqual({
      id: "none",
      position: { x: 50, y: 50 },
    })
  })

  it("accepts a known backdrop and clamps its focal point", () => {
    expect(
      normalizeConfig({
        preset: "rich-profile",
        backdrop: { id: "ambient-02", position: { x: 120, y: -20 } },
      }).backdrop,
    ).toEqual({
      id: "ambient-02",
      position: { x: 100, y: 0 },
    })
  })

  it("falls back to a safe backdrop for unknown values", () => {
    expect(normalizeConfig({ backdrop: { id: "unknown" } }).backdrop).toEqual({
      id: "none",
      position: { x: 50, y: 50 },
    })
  })
})
