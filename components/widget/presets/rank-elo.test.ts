import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { createDefaultConfig, type WidgetData } from "@/lib/widget"

import { RankEloPreset } from "./rank-elo"

const data: WidgetData = {
  profile: { nickname: "nachete", countryCode: "uy" },
  rank: { level: 10, elo: 2_173, worldRank: 2_345, countryRank: 38 },
}

const challengerData: WidgetData = {
  ...data,
  rank: { ...data.rank, worldRank: 174 },
}

describe("RankEloPreset", () => {
  it("places the world rank beside the country rank for non-Challengers", () => {
    const config = createDefaultConfig("rank-elo")
    config.visibility.worldRank = true

    const markup = renderToStaticMarkup(createElement(RankEloPreset, { data, config }))

    expect(markup.indexOf('title="Country rank"')).toBeLessThan(markup.indexOf('title="World rank"'))
  })

  it.each([
    [false, false, false],
    [true, false, false],
    [false, true, true],
    [true, true, true],
  ])("keeps Challenger rank number state consistent (world rank: %s, rank number: %s)", (worldRank, challengerRank, showsRankNumber) => {
    const config = createDefaultConfig("rank-elo")
    config.visibility.worldRank = worldRank
    config.visibility.challengerRank = challengerRank

    const markup = renderToStaticMarkup(createElement(RankEloPreset, { data: challengerData, config }))

    expect(markup.includes(">#174<")).toBe(showsRankNumber)
  })
})
