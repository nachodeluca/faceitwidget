import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { createDefaultConfig, type WidgetData } from "@/lib/widget"

import { getPerformanceKills, PerformanceCardPreset } from "./performance-card"

const data: WidgetData = {
  profile: { nickname: "n4me", countryCode: "kr" },
  rank: { level: 8, elo: 1_640, eloChange: 27, worldRank: 2_500, countryRank: 1_337 },
  lifetime: { avgKills: 20, kdr: 2, headshotRate: 50 },
  last30: { winRate: 50 },
  today: { wins: 2, losses: 0 },
}

function renderPerformanceCard(
  overrides: Partial<ReturnType<typeof createDefaultConfig>["visibility"]> = {},
  profileData: WidgetData = data,
) {
  const config = createDefaultConfig("performance-card")
  config.visibility = { ...config.visibility, ...overrides }

  return renderToStaticMarkup(createElement(PerformanceCardPreset, { data: profileData, config }))
}

describe("PerformanceCardPreset", () => {
  it("falls back to recent match kills when lifetime kills are missing", () => {
    expect(getPerformanceKills({
      ...data,
      lifetime: { kdr: 2, headshotRate: 50 },
      last30: { avgKills: 18, winRate: 50 },
    })).toBe(18)
  })

  it("renders the performance metrics and level progress bar", () => {
    const markup = renderPerformanceCard({ countryRank: true })

    expect(markup).toContain("data-widget-nickname")
    expect(markup).toContain("Kills")
    expect(markup).toContain("K/D")
    expect(markup).toContain("HS %")
    expect(markup).toContain("Wins %")
    expect(markup).toContain("/flags/kr.svg")
    expect(markup).toContain("#1,337")
    expect(markup).toContain("w-[34px]")
    expect(markup).toContain('aria-label="Level 8 progress"')
    expect(markup).toContain('aria-valuenow="50"')
    expect(markup).toContain("--performance-progress-color:#FF6309")
  })

  it("keeps the country rank line off by default", () => {
    const markup = renderPerformanceCard()

    expect(markup).not.toContain("/flags/kr.svg")
    expect(markup).not.toContain("#1,337")
  })

  it("keeps W/L labels and ELO change opt-in", () => {
    const defaultMarkup = renderPerformanceCard()
    const enabledMarkup = renderPerformanceCard({ recordLabels: true, eloChange: true })

    expect(defaultMarkup).not.toContain(">wins<")
    expect(defaultMarkup).not.toContain("text-[#83dba5]")
    expect(enabledMarkup).toContain(">wins<")
    expect(enabledMarkup).toContain("text-[#83dba5]")
  })

  it("can hide each optional metric and the progress bar", () => {
    const markup = renderPerformanceCard({
      avgKills: false,
      kdr: false,
      headshotRate: false,
      winRate: false,
      rankProgress: false,
    })

    expect(markup).not.toContain("Kills")
    expect(markup).not.toContain("HS %")
    expect(markup).not.toContain("Wins %")
    expect(markup).not.toContain("progressbar")
  })

  it("uses the Challenger color and a full bar for Challenger players", () => {
    const markup = renderPerformanceCard({}, {
      ...data,
      rank: { ...data.rank, level: 10, worldRank: 174 },
    })

    expect(markup).toContain("--challenger-icon-color")
    expect(markup).toContain(">#174<")
    expect(markup).toContain('aria-label="Challenger progress"')
    expect(markup).toContain('aria-valuenow="100"')
    expect(markup).toContain("--performance-progress-color:#E80129")
  })

  it("keeps the Challenger icon while hiding its rank number when disabled", () => {
    const markup = renderPerformanceCard({ challengerRank: false }, {
      ...data,
      rank: { ...data.rank, level: 10, worldRank: 174 },
    })

    expect(markup).toContain("--challenger-icon-color")
    expect(markup).toContain("size-8")
    expect(markup).not.toContain(">#174<")
  })

  it("can hide the country rank line", () => {
    const markup = renderPerformanceCard({ countryRank: false })

    expect(markup).not.toContain("/flags/kr.svg")
    expect(markup).not.toContain("#1,337")
  })
})
