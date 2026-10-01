import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { createDefaultConfig, type WidgetData } from "@/lib/widget"

import { RankCountryPreset } from "./rank-country"

const data: WidgetData = {
  profile: { nickname: "nachete", countryCode: "uy", regionCode: "SA" },
  rank: { level: 10, elo: 2_173, regionRank: 2_345, countryRank: 38 },
}

describe("RankCountryPreset", () => {
  it("keeps Regional Ranking in the right-side rank group for non-Challengers", () => {
    const config = createDefaultConfig("rank-country")
    config.visibility.regionRank = true

    const markup = renderToStaticMarkup(createElement(RankCountryPreset, { data, config }))

    expect(markup.indexOf('title="Country rank"')).toBeLessThan(markup.indexOf('title="Regional Ranking (SA)"'))
  })

  it("renders one Regional Ranking with its region logo", () => {
    const config = createDefaultConfig("rank-country")
    config.visibility.regionRank = true

    const markup = renderToStaticMarkup(
      createElement(RankCountryPreset, { data, config }),
    )

    expect(markup.match(/title="Regional Ranking \(SA\)"/g)).toHaveLength(1)
    expect(markup).toContain("<title>SA</title>")
  })
})
