import { describe, expect, it } from "vitest"

import { createDefaultConfig, updateVisibilityConfig } from "./config/config"
import { getEditableFields } from "./config/presets"
import { isChallengerRank } from "./rank"
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
    expect(isChallengerRank(rank({ regionRank: 2_486, isChallenger: true }))).toBe(false)
  })

  it("hides Challenger controls for non-Challenger players", () => {
    const fields = getEditableFields("rich-profile", rank({ regionRank: 2_486 }))

    expect(fields).not.toContain("challenger")
    expect(fields).not.toContain("challengerRank")
  })
})

describe("rank preset defaults", () => {
  it("starts Rank + ELO without the global rank", () => {
    expect(createDefaultConfig("rank-elo").visibility.worldRank).toBe(false)
  })

  it("starts Rank + Country without the global rank", () => {
    expect(createDefaultConfig("rank-country").visibility.worldRank).toBe(false)
  })

  it("shows the nickname in Today Stats by default", () => {
    expect(createDefaultConfig("today-stats").visibility.nickname).toBe(true)
  })

  it("keeps the Challenger badge behind the World rank switch", () => {
    const config = createDefaultConfig("rank-country")
    const enabled = updateVisibilityConfig(config, "worldRank", true)

    expect(enabled.visibility.worldRank).toBe(true)
  })

  it("adds K/D to the selected rotating fields", () => {
    const config = createDefaultConfig("today-stats")
    const updated = updateVisibilityConfig(config, "kdr", true)

    expect(updated.visibility.kdr).toBe(true)
    expect(updated.rotation.fields).toContain("lifetime")
  })
})
