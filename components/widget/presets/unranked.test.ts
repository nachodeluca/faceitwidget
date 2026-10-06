import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { createDefaultConfig, type WidgetData } from "@/lib/widget"
import { WIDGET_PRESET_IDS } from "@/lib/widget/types"
import { CountryRank, LevelRankBadge, RegionRank } from "../parts"
import { PresetView } from "../preset-view"
import { PerformanceCardPreset } from "./performance-card"

const data: WidgetData = {
  profile: { nickname: "nexoonszx090", countryCode: "ru", regionCode: "EU" },
  rank: {
    status: "unranked",
    level: 0,
    elo: 0,
    placements: { played: 6, total: 10 },
    regionRank: 174,
    countryRank: 38,
    eloChange: -2_327,
    isChallenger: true,
  },
  lifetime: { avgKills: 15, kdr: 0.92, headshotRate: 50 },
  today: { wins: 3, losses: 3 },
  last30: { winRate: 50 },
}

describe("Unranked presets", () => {
  it.each(WIDGET_PRESET_IDS)("shows the SVG and Unranked without an ELO suffix in %s", (preset) => {
    const config = createDefaultConfig(preset)
    config.visibility.eloIcon = true
    config.visibility.eloChange = true
    const markup = renderToStaticMarkup(createElement(PresetView, { data, config }))
    expect(markup).toContain("/levels/unranked.svg")
    expect(markup).toContain(">Unranked<")
    expect(markup).not.toContain("/levels/01.svg")
    expect(markup).not.toContain(">ELO<")
    expect(markup).not.toContain('d="M12 3c0 .463')
    expect(markup).not.toContain(">#0<")
    expect(markup).not.toContain("--challenger-icon-color")
    expect(markup).not.toContain("text-[#ff7884] tabular-nums")
  })

  it.each(WIDGET_PRESET_IDS)("respects hidden level and ELO fields in %s", (preset) => {
    const config = createDefaultConfig(preset)
    config.visibility.level = false
    config.visibility.elo = false
    const markup = renderToStaticMarkup(createElement(PresetView, { data, config }))
    expect(markup).not.toContain("/levels/unranked.svg")
    expect(markup).not.toContain(">Unranked<")
  })

  it("shows #TBD for both rankings even if stale numeric positions exist", () => {
    const visibility = createDefaultConfig("rank-country").visibility
    visibility.regionRank = true
    visibility.countryRank = true
    const country = renderToStaticMarkup(createElement(CountryRank, { data, visibility }))
    const region = renderToStaticMarkup(createElement(RegionRank, { data, visibility }))
    expect(country).toContain(">#TBD<")
    expect(country).toContain("/flags/ru.svg")
    expect(region).toContain(">#TBD<")
    expect(region).toContain("Regional Ranking (EU)")
    expect(region).not.toContain("#174")
    expect(country).not.toContain("#38")
    expect(renderToStaticMarkup(createElement(LevelRankBadge, { data, visibility }))).not.toContain(
      ">#0<",
    )
  })

  it("supports older snapshots without the new status field", () => {
    const config = createDefaultConfig("elo-pill")
    const legacyData: WidgetData = { ...data, rank: { level: 0, elo: 0 } }
    const markup = renderToStaticMarkup(createElement(PresetView, { data: legacyData, config }))
    expect(markup).toContain("/levels/unranked.svg")
    expect(markup).toContain(">Unranked<")
  })

  it.each([0, 6, 9, 10])("shows %s/10 placements on the existing progress bar", (played) => {
    const config = createDefaultConfig("performance-card")
    const markup = renderToStaticMarkup(
      createElement(PerformanceCardPreset, {
        data: { ...data, rank: { ...data.rank, placements: { played, total: 10 } } },
        config,
      }),
    )
    expect(markup).toContain(`>${played}/10 placements<`)
    expect(markup).toContain(`aria-valuenow="${played * 10}"`)
    expect(markup).toContain("--performance-progress-color:#CDCDCD")
    expect(markup).not.toContain("Level 1 progress")
  })

  it("hides unknown progress and respects the progress visibility setting", () => {
    const config = createDefaultConfig("performance-card")
    const unavailable = { ...data, rank: { ...data.rank, placements: undefined } }
    expect(
      renderToStaticMarkup(createElement(PerformanceCardPreset, { data: unavailable, config })),
    ).not.toContain("progressbar")
    config.visibility.rankProgress = false
    expect(
      renderToStaticMarkup(createElement(PerformanceCardPreset, { data, config })),
    ).not.toContain("progressbar")
  })

  it("returns to numeric ELO, rankings and level progress when ranked", () => {
    const config = createDefaultConfig("performance-card")
    config.visibility.countryRank = true
    const ranked: WidgetData = {
      ...data,
      rank: { status: "ranked", level: 4, elo: 1_000, countryRank: 38 },
    }
    const markup = renderToStaticMarkup(
      createElement(PerformanceCardPreset, { data: ranked, config }),
    )
    expect(markup).toContain("/levels/04.svg")
    expect(markup).toContain(">ELO<")
    expect(markup).toContain(">#38<")
    expect(markup).toContain("Level 4 progress")
    expect(markup).not.toContain("Unranked")
    expect(markup).not.toContain("placements")
    expect(markup).not.toContain("#TBD")
  })
})
