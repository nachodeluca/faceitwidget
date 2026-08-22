import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { createDefaultConfig, type WidgetData } from "@/lib/widget"

import { RankCountryPreset } from "./rank-country"

const data: WidgetData = {
  profile: { nickname: "nachete", countryCode: "uy" },
  rank: { level: 10, elo: 2_173, worldRank: 2_345, countryRank: 38 },
}

describe("RankCountryPreset", () => {
  it("keeps the world rank in the right-side rank group for non-Challengers", () => {
    const config = createDefaultConfig("rank-country")
    config.visibility.worldRank = true

    const markup = renderToStaticMarkup(createElement(RankCountryPreset, { data, config }))

    expect(markup.indexOf('title="Country rank"')).toBeLessThan(markup.indexOf('title="World rank"'))
  })

  it("does not render the removed regional rank control", () => {
    const config = createDefaultConfig("rank-country")
    config.visibility.worldRank = true
    config.visibility.regionRank = true

    const markup = renderToStaticMarkup(
      createElement(RankCountryPreset, { data, config }),
    )

    expect(markup.match(/title="World rank"/g)).toHaveLength(1)
    expect(markup).not.toContain('title="Region rank"')
  })
})
