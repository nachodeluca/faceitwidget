import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { createDefaultConfig, normalizeConfig, type WidgetData } from "@/lib/widget"

import { Widget } from "./widget"

const data: WidgetData = {
  profile: { nickname: "nachete", countryCode: "uy" },
  rank: { level: 10, elo: 2_173, worldRank: 2_345, countryRank: 38 },
}

describe("Widget surface", () => {
  it("keeps the game visible through a translucent dark surface", () => {
    const defaults = createDefaultConfig("elo-pill")
    const config = normalizeConfig({
      ...defaults,
      style: { ...defaults.style, background: "none" },
    })

    const markup = renderToStaticMarkup(createElement(Widget, { data, config }))

    expect(markup).toContain('data-background="none"')
    expect(markup).toContain("bg-[rgb(0_0_0_/_28%)]")
    expect(markup).not.toContain("data-widget-surface-overlay")
  })
})
