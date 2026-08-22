import { describe, expect, it } from "vitest"

import { createDefaultConfig, normalizeConfig, updateVisibilityConfig } from "./config/config"
import { getEditableFields, getRotationFields } from "./config/presets"
import { hasEloChange, isChallengerRank } from "./rank"
import type { WidgetData } from "./types"

function rank(overrides: Partial<WidgetData["rank"]> = {}): WidgetData["rank"] {
  return {
    level: 10,
    elo: 2_000,
    worldRank: 1_000,
    regionRank: 1_000,
    ...overrides,
  }
}

describe("isChallengerRank", () => {
  it("includes level 10 players through regional rank 1000", () => {
    expect(isChallengerRank(rank())).toBe(true)
  })

  it("rejects players outside the regional top 1000", () => {
    expect(isChallengerRank(rank({ worldRank: 2_486, regionRank: 2_486 }))).toBe(false)
  })

  it("does not trust a contradictory Challenger flag", () => {
    expect(isChallengerRank(rank({ worldRank: 2_486, regionRank: 2_486, isChallenger: true }))).toBe(false)
  })

  it("hides Challenger controls for non-Challenger players", () => {
    const fields = getEditableFields("rich-profile", rank({ worldRank: 2_486, regionRank: 2_486 }))

    expect(fields).not.toContain("challenger")
    expect(fields).not.toContain("challengerRank")
  })

  it("hides the unused World rank control for Challenger Rank + Country", () => {
    const fields = getEditableFields("rank-country", rank())

    expect(fields).not.toContain("worldRank")
  })

  it("hides the unused World rank control for Challenger Rank + ELO", () => {
    const fields = getEditableFields("rank-elo", rank())

    expect(fields).not.toContain("worldRank")
  })

  it("hides the unused World rank control for Challenger Last 30", () => {
    const fields = getEditableFields("rich-history", rank())

    expect(fields).not.toContain("worldRank")
  })

  it("keeps World rank for non-Challenger Rank + Country", () => {
    const fields = getEditableFields("rank-country", rank({ worldRank: 2_486, regionRank: 2_486 }))

    expect(fields).toContain("worldRank")
    expect(fields).not.toContain("regionRank")
  })
})

describe("hasEloChange", () => {
  it("hides missing and unchanged ELO", () => {
    expect(hasEloChange(undefined)).toBe(false)
    expect(hasEloChange(0)).toBe(false)
    expect(hasEloChange(-0)).toBe(false)
  })

  it("shows gained and lost ELO", () => {
    expect(hasEloChange(30)).toBe(true)
    expect(hasEloChange(-10)).toBe(true)
  })
})

describe("rank preset defaults", () => {
  it("starts Rank + ELO without the global rank", () => {
    expect(createDefaultConfig("rank-elo").visibility.worldRank).toBe(false)
  })

  it("starts Rank + Country without the global rank", () => {
    expect(createDefaultConfig("rank-country").visibility.worldRank).toBe(false)
  })

  it("starts Last 30 without the global rank", () => {
    expect(createDefaultConfig("rich-history").visibility.worldRank).toBe(false)
    expect(getRotationFields("rich-history")).not.toContain("lifetime")
  })

  it("starts Profile Card without the global rank", () => {
    const config = createDefaultConfig("profile-card")

    expect(config.visibility.worldRank).toBe(false)
    expect(config.visibility.challengerRank).toBe(false)
  })

  it("hides the unused World rank control for Challenger Profile Card", () => {
    const fields = getEditableFields("profile-card", rank())

    expect(fields).not.toContain("worldRank")
  })

  it("shows the nickname in Today Stats by default", () => {
    expect(createDefaultConfig("today-stats").visibility.nickname).toBe(true)
  })

  it("exposes Challenger rank without exposing the unused K/D switch", () => {
    const fields = getEditableFields("today-stats", rank())

    expect(fields).toContain("challengerRank")
    expect(fields).not.toContain("kdr")
    expect(getRotationFields("today-stats")).not.toContain("lifetime")
    expect(createDefaultConfig("today-stats").visibility.challengerRank).toBe(false)

    const legacyConfig = normalizeConfig({
      preset: "today-stats",
      visibility: { kdr: true },
      rotation: { fields: ["lifetime"] },
    })
    expect(legacyConfig.rotation.fields).not.toContain("lifetime")
  })

  it("keeps the Challenger badge behind the World rank switch", () => {
    const config = createDefaultConfig("rank-country")
    const enabled = updateVisibilityConfig(config, "worldRank", true)

    expect(enabled.visibility.worldRank).toBe(true)
  })

  it("adds K/D to the selected rotating fields", () => {
    const config = createDefaultConfig("rich-profile")
    const updated = updateVisibilityConfig(config, "kdr", true)

    expect(updated.visibility.kdr).toBe(true)
    expect(updated.rotation.fields).toContain("lifetime")
  })
})
