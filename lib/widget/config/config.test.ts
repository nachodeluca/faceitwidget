import { describe, expect, it } from "vitest"

import { createDefaultConfig, normalizeConfig } from "./config"
import { getEditableFields, WIDGET_PRESETS } from "./presets"

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

describe("verification badge visibility", () => {
  it("offers the badge setting only on presets that expose a nickname", () => {
    expect(getEditableFields("today-stats")).toContain("verifiedBadge")
    expect(getEditableFields("profile-card")).toContain("verifiedBadge")
    expect(getEditableFields("performance-card")).toContain("verifiedBadge")
    expect(getEditableFields("elo-pill")).not.toContain("verifiedBadge")
    expect(getEditableFields("rank-elo")).not.toContain("verifiedBadge")
    expect(getEditableFields("rank-country")).not.toContain("verifiedBadge")
    expect(getEditableFields("rich-profile")).not.toContain("verifiedBadge")
  })

  it("defaults the option off and normalizes missing values to off", () => {
    expect(createDefaultConfig("profile-card").visibility.verifiedBadge).toBe(false)
    expect(
      normalizeConfig({ preset: "profile-card", visibility: { nickname: true } }).visibility
        .verifiedBadge,
    ).toBe(false)
  })
})

describe("ELO icon visibility", () => {
  it("uses the requested defaults and exposes its switch on every preset", () => {
    const disabledByDefault = new Set(["rank-elo", "elo-pill", "rank-country", "rich-profile"])

    for (const preset of WIDGET_PRESETS) {
      expect(createDefaultConfig(preset.id).visibility.eloIcon).toBe(
        !disabledByDefault.has(preset.id),
      )
      expect(getEditableFields(preset.id)).toContain("eloIcon")
    }
  })

  it("normalizes an explicit ELO icon setting", () => {
    expect(
      normalizeConfig({
        preset: "compact",
        visibility: { elo: true, eloIcon: false },
      }).visibility.eloIcon,
    ).toBe(false)
  })

  it("keeps the ELO icon off in saved configs that predate the option", () => {
    for (const preset of WIDGET_PRESETS) {
      expect(
        normalizeConfig({ preset: preset.id, visibility: { elo: true } }).visibility.eloIcon,
      ).toBe(false)
    }
  })
})
