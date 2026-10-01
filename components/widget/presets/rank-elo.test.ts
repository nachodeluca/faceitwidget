import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { createDefaultConfig, type WidgetData } from "@/lib/widget"

import { RankEloPreset } from "./rank-elo"

const data: WidgetData = {
  profile: { nickname: "nachete", countryCode: "uy", regionCode: "SA" },
  rank: { level: 10, elo: 2_173, regionRank: 2_345, countryRank: 38 },
}

const challengerData: WidgetData = {
  ...data,
  rank: { ...data.rank, regionRank: 174 },
}

describe("RankEloPreset", () => {
  it("places Regional Ranking beside the country rank for non-Challengers", () => {
    const config = createDefaultConfig("rank-elo")
    config.visibility.regionRank = true

    const markup = renderToStaticMarkup(createElement(RankEloPreset, { data, config }))

    expect(markup.indexOf('title="Country rank"')).toBeLessThan(markup.indexOf('title="Regional Ranking (SA)"'))
  })

  it.each([
    [false, false, false],
    [true, false, false],
    [false, true, true],
    [true, true, true],
  ])("keeps Challenger rank number state consistent (Regional Ranking: %s, rank number: %s)", (regionalRanking, challengerRank, showsRankNumber) => {
    const config = createDefaultConfig("rank-elo")
    config.visibility.regionRank = regionalRanking
    config.visibility.challengerRank = challengerRank

    const markup = renderToStaticMarkup(createElement(RankEloPreset, { data: challengerData, config }))

    expect(markup.includes(">#174<")).toBe(showsRankNumber)
  })
})
