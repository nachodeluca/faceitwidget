import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { createDefaultConfig, type WidgetData } from "@/lib/widget"

import { RichStatsPreset } from "./rich-stats"

const data: WidgetData = {
  profile: { nickname: "nachete", countryCode: "uy" },
  rank: { level: 10, elo: 2_173, worldRank: 2_345, countryRank: 38 },
}

const challengerData: WidgetData = {
  ...data,
  rank: { ...data.rank, worldRank: 174 },
}

describe("RichStatsPreset", () => {
  it("places world rank beside country rank for non-Challengers", () => {
    const config = createDefaultConfig("rich-profile")
    config.visibility.worldRank = true

    const markup = renderToStaticMarkup(createElement(RichStatsPreset, { data, config }))

    expect(markup.indexOf('title="Country rank"')).toBeLessThan(markup.indexOf('title="World rank"'))
  })

  it.each([
    [false, false],
    [true, false],
    [false, true],
    [true, true],
  ])("keeps Challenger rank number independent from World rank (%s, %s)", (worldRank, challengerRank) => {
    const config = createDefaultConfig("rich-profile")
    config.visibility.worldRank = worldRank
    config.visibility.challengerRank = challengerRank

    const markup = renderToStaticMarkup(createElement(RichStatsPreset, { data: challengerData, config }))

    expect(markup.includes(">#174<")).toBe(challengerRank)
  })
})
