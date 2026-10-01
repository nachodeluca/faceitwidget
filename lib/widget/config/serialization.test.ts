import { describe, expect, it } from "vitest"

import { createDefaultConfig, normalizeConfig } from "./config"
import { buildWidgetUrl, deserializeConfig, serializeConfig } from "./serialization"

function legacyToken(value: unknown) {
  return Buffer.from(JSON.stringify(value), "utf8").toString("base64url")
}

describe("widget config serialization", () => {
  it("uses a current-version preset token when the config matches its defaults", () => {
    const config = createDefaultConfig("rich-profile")

    expect(serializeConfig(config)).toBe("v3.rich-profile")
    expect(deserializeConfig("v3.rich-profile")).toEqual(config)
  })

  it("round-trips custom visibility, style, and motion settings", () => {
    const defaults = createDefaultConfig("rich-profile")
    const config = normalizeConfig({
      ...defaults,
      visibility: {
        ...defaults.visibility,
        nickname: true,
        verifiedBadge: true,
        todayStats: false,
        last5Results: true,
      },
      style: { ...defaults.style, scale: 1.25, borderEnabled: true, border: "#ffffff" },
      rotation: { ...defaults.rotation, enabled: false, intervalMs: 5000, fields: ["lifetime"] },
    })
    const serialized = serializeConfig(config)

    expect(serialized.length).toBeLessThan(300)
    expect(deserializeConfig(serialized)).toEqual(config)
  })

  it("round-trips Performance Card visibility switches", () => {
    const defaults = createDefaultConfig("performance-card")
    const config = normalizeConfig({
      ...defaults,
      visibility: {
        ...defaults.visibility,
        eloChange: true,
        recordLabels: true,
        rankProgress: false,
      },
    })
    const serialized = serializeConfig(config)

    expect(serialized).not.toBe("v3.performance-card")
    expect(deserializeConfig(serialized)).toEqual(config)
  })

  it("keeps the ELO icon off in v2 links", () => {
    expect(deserializeConfig("v2.profile-card").visibility.verifiedBadge).toBe(false)
    expect(deserializeConfig("v2.profile-card").visibility.eloIcon).toBe(false)
    expect(createDefaultConfig("today-stats").visibility.verifiedBadge).toBe(false)
    expect(createDefaultConfig("today-stats").visibility.eloIcon).toBe(true)
    expect(deserializeConfig("v3.today-stats").visibility.eloIcon).toBe(true)
  })

  it("keeps old compact masks and full JSON widgets visually unchanged", () => {
    const legacyDefaults = createDefaultConfig("rich-profile")
    const oldVisibility = { ...legacyDefaults.visibility }
    delete (oldVisibility as Partial<typeof oldVisibility>).eloIcon
    const legacyConfig = { ...legacyDefaults, visibility: oldVisibility }
    const oldMask = [2, 3, 4, 6, 7, 8, 9, 10, 11].reduce((mask, bit) => mask | (1 << bit), 0)

    const oldFullConfig = deserializeConfig(legacyToken(legacyConfig))
    const oldMaskedConfig = deserializeConfig(`v2.${legacyToken({ v: 2, p: "rich-profile", x: oldMask.toString(36) })}`)
    const oldPresetConfig = deserializeConfig("v2.rich-profile")

    expect(oldFullConfig.visibility.eloIcon).toBe(false)
    expect(oldMaskedConfig.visibility.eloIcon).toBe(false)
    expect(oldMaskedConfig.visibility.regionRank).toBe(true)
    expect(oldPresetConfig.visibility.eloIcon).toBe(false)
  })

  it("round-trips the ELO icon switch in current links", () => {
    const defaults = createDefaultConfig("compact")
    const config = normalizeConfig({
      ...defaults,
      visibility: { ...defaults.visibility, eloIcon: false },
    })

    expect(deserializeConfig(serializeConfig(config))).toEqual(config)
  })

  it("round-trips a selected backdrop and focal point", () => {
    const config = normalizeConfig({
      preset: "rank-elo",
      backdrop: { id: "ambient-03", position: { x: 24, y: 76 } },
    })
    const serialized = serializeConfig(config)

    expect(serialized).not.toBe("v3.rank-elo")
    expect(deserializeConfig(serialized).backdrop).toEqual(config.backdrop)
  })

  it("round-trips a custom image backdrop without embedding its URL", () => {
    const config = normalizeConfig({
      preset: "elo-pill",
      backdrop: {
        id: "00000000-0000-4000-8000-000000000001",
        media: "image",
        position: { x: 18, y: 82 },
      },
    })
    const serialized = serializeConfig(config)

    expect(serialized).not.toContain("assets.faceitwidget.com")
    expect(deserializeConfig(serialized).backdrop).toEqual(config.backdrop)
  })

  it("builds short widget URLs", () => {
    const url = buildWidgetUrl(
      "https://faceitwidget.com",
      "fee75936-fca2-41fb-899e-b2e09263de50",
      createDefaultConfig("rich-profile"),
      "America/Montevideo",
    )

    expect(url).toContain("playerId=fee75936-fca2-41fb-899e-b2e09263de50")
    expect(url).not.toContain("nickname=")
    expect(url).toContain("config=v3.rich-profile")
    expect(url).not.toContain("eyJ2ZXJzaW9u")
  })

  it("falls back when an old link references a removed preset", () => {
    expect(deserializeConfig("v2.elo-level").preset).toBe("elo-pill")
    expect(deserializeConfig("v2.stream-card").preset).toBe("elo-pill")
  })

  it("maps the removed Last 30 preset to Rich Profile", () => {
    const config = createDefaultConfig("rich-profile")

    expect(deserializeConfig("v2.rich-history").preset).toBe("rich-profile")
    expect(deserializeConfig("v2.rich-history").visibility.eloIcon).toBe(false)
    expect(deserializeConfig(`v2.${legacyToken({ v: 2, p: "rich-history" })}`).preset).toBe("rich-profile")
    expect(deserializeConfig(`v2.${legacyToken({ v: 2, p: "rich-history" })}`).visibility.eloIcon).toBe(false)
    expect(normalizeConfig({ ...config, preset: "rich-history" }).preset).toBe("rich-profile")
  })
})
