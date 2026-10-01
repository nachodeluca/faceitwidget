import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { createDefaultConfig, type WidgetData } from "@/lib/widget"

import { RichStatsPreset } from "./rich-stats"

const data: WidgetData = {
  profile: { nickname: "nachete", countryCode: "uy", regionCode: "SA" },
  rank: { level: 10, elo: 2_173, regionRank: 2_345, countryRank: 38 },
}

const challengerData: WidgetData = {
  ...data,
  rank: { ...data.rank, regionRank: 174 },
}

describe("RichStatsPreset", () => {
  it("places Regional Ranking beside country rank for non-Challengers", () => {
    const config = createDefaultConfig("rich-profile")
    config.visibility.regionRank = true

    const markup = renderToStaticMarkup(createElement(RichStatsPreset, { data, config }))

    expect(markup.indexOf('title="Country rank"')).toBeLessThan(markup.indexOf('title="Regional Ranking (SA)"'))
  })

  it.each([
    [false, false],
    [true, false],
    [false, true],
    [true, true],
  ])("keeps Challenger rank number independent from Regional Ranking (%s, %s)", (regionalRanking, challengerRank) => {
    const config = createDefaultConfig("rich-profile")
    config.visibility.regionRank = regionalRanking
    config.visibility.challengerRank = challengerRank

    const markup = renderToStaticMarkup(createElement(RichStatsPreset, { data: challengerData, config }))

    expect(markup.includes(">#174<")).toBe(challengerRank)
  })
})
