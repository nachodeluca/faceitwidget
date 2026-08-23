import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { createDefaultConfig } from "@/lib/widget"

import { RotatingDetails } from "./rotation-details"

const data = {
  profile: { nickname: "nachete", countryCode: "uy" },
  rank: { level: 10, elo: 2_173, worldRank: 2_345, countryRank: 38 },
  last30: { winRate: 50, avgKills: 17, adr: 84.8, avgKD: 1.09 },
}

describe("RotatingDetails", () => {
  it("does not show lifetime performance when K/D is not selected", () => {
    const config = createDefaultConfig("rich-profile")
    config.visibility.todayStats = false
    config.visibility.last30Stats = true
    config.visibility.kdr = true
    config.rotation.fields = ["last30", "lifetime"]

    const markup = renderToStaticMarkup(createElement(RotatingDetails, { data, config }))

    expect(markup).toContain("Last 30 matches")
    expect(markup).not.toContain(">AVG<")
  })
})
