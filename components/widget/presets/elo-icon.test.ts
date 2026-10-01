import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { createDefaultConfig, type WidgetData } from "@/lib/widget"

import { PresetView } from "../preset-view"
import { WIDGET_PRESETS } from "@/lib/widget/config/presets"

const data: WidgetData = {
  profile: { nickname: "nachete", countryCode: "uy", regionCode: "SA" },
  rank: { level: 10, elo: 2_173, regionRank: 2_345, countryRank: 38 },
  lifetime: { avgKills: 20, kdr: 1.2, headshotRate: 50, kr: 0.8 },
  today: { wins: 3, losses: 2, avgKills: 18, adr: 86, avgKD: 1.16 },
  last30: { winRate: 60, avgKills: 18, adr: 86, avgKD: 1.16, avgKR: 0.8 },
  last5Results: ["win", "loss", "win", "win", "loss"],
}

function renderPreset(preset: (typeof WIDGET_PRESETS)[number]["id"], eloIcon: boolean) {
  const config = createDefaultConfig(preset)
  config.visibility.eloIcon = eloIcon

  return renderToStaticMarkup(createElement(PresetView, { data, config }))
}

describe("ELO icon preset setting", () => {
  it.each(WIDGET_PRESETS.map(({ id }) => id))("can show or hide the icon in %s", (preset) => {
    const visibleMarkup = renderPreset(preset, true)
    const hiddenMarkup = renderPreset(preset, false)

    expect(visibleMarkup).toContain('d="M12 3c0 .463')
    expect(hiddenMarkup).not.toContain('d="M12 3c0 .463')
  })

  it.each(["performance-card", "profile-card"] as const)("aligns the ELO value and label in %s", (preset) => {
    expect(renderPreset(preset, true)).toContain("inline-flex min-w-0 items-center gap-[3px]")
  })
})
