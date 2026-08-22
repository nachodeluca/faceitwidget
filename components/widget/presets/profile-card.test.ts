import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { createDefaultConfig, type WidgetData } from "@/lib/widget"

import { ProfileCardPreset } from "./profile-card"

const data: WidgetData = {
  profile: { nickname: "nachete", countryCode: "uy" },
  rank: { level: 10, elo: 2_173, worldRank: 2_345, countryRank: 38 },
  today: { wins: 2, losses: 1 },
}

const challengerData: WidgetData = {
  ...data,
  rank: { ...data.rank, worldRank: 174 },
}

function renderProfileCard(
  overrides: Partial<ReturnType<typeof createDefaultConfig>["visibility"]> = {},
  profileData: WidgetData = data,
) {
  const config = createDefaultConfig("profile-card")
  config.visibility = { ...config.visibility, ...overrides }

  return renderToStaticMarkup(createElement(ProfileCardPreset, { data: profileData, config }))
}

describe("ProfileCardPreset ranks", () => {
  it("orders country rank before world rank", () => {
    const markup = renderProfileCard({ worldRank: true })

    expect(markup.indexOf("#38")).toBeLessThan(markup.indexOf("#2,345"))
    expect(markup).toContain("/flags/uy.svg")
    expect(markup).toContain('title="World rank"')
  })

  it("starts with world rank hidden", () => {
    const markup = renderProfileCard()

    expect(markup).not.toContain("#2,345")
    expect(markup).toContain("#38")
  })

  it("shows the level mark for non-Challengers", () => {
    const markup = renderProfileCard()

    expect(markup).toContain("/levels/10.svg")
  })

  it("keeps the Challenger mark when world rank is hidden", () => {
    const markup = renderProfileCard({ worldRank: false, challengerRank: false }, challengerData)

    expect(markup).toContain("--challenger-icon-color")
    expect(markup).not.toContain(">#174<")
  })

  it("shows the Challenger rank number independently of World rank", () => {
    const markup = renderProfileCard({ worldRank: false, challengerRank: true }, challengerData)

    expect(markup).toContain(">#174<")
    expect(markup).toContain("--challenger-icon-color")
  })

  it("hides the flag and country ranking together", () => {
    const markup = renderProfileCard({ countryRank: false, worldRank: true })

    expect(markup).toContain("#2,345")
    expect(markup).not.toContain("#38")
    expect(markup).not.toContain("/flags/uy.svg")
  })

  it("hides only the world ranking", () => {
    const markup = renderProfileCard({ worldRank: false })

    expect(markup).not.toContain("#2,345")
    expect(markup).toContain("#38")
    expect(markup).toContain("/flags/uy.svg")
  })
})
