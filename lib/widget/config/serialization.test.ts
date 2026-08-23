import { describe, expect, it } from "vitest"

import { createDefaultConfig, normalizeConfig } from "./config"
import { buildWidgetUrl, deserializeConfig, serializeConfig } from "./serialization"

function legacyToken(value: unknown) {
  return Buffer.from(JSON.stringify(value), "utf8").toString("base64url")
}

describe("widget config serialization", () => {
  it("uses a preset-only token when the config matches its defaults", () => {
    const config = createDefaultConfig("rich-history")

    expect(serializeConfig(config)).toBe("v2.rich-history")
    expect(deserializeConfig("v2.rich-history")).toEqual(config)
  })

  it("round-trips custom visibility, style, and motion settings", () => {
    const defaults = createDefaultConfig("rich-history")
    const config = normalizeConfig({
      ...defaults,
      visibility: { ...defaults.visibility, nickname: true, todayStats: false, last5Results: true },
      style: { ...defaults.style, scale: 1.25, borderEnabled: true, border: "#ffffff" },
      rotation: { ...defaults.rotation, enabled: false, intervalMs: 5000, fields: ["lifetime"] },
    })
    const serialized = serializeConfig(config)

    expect(serialized.length).toBeLessThan(300)
    expect(deserializeConfig(serialized)).toEqual(config)
  })

  it("keeps reading the previous full JSON format", () => {
    const config = createDefaultConfig("rich-history")

    expect(deserializeConfig(legacyToken(config))).toEqual(config)
  })

  it("builds short widget URLs", () => {
    const url = buildWidgetUrl(
      "https://faceitwidget.com",
      "fee75936-fca2-41fb-899e-b2e09263de50",
      createDefaultConfig("rich-history"),
      "America/Montevideo",
    )

    expect(url).toContain("playerId=fee75936-fca2-41fb-899e-b2e09263de50")
    expect(url).not.toContain("nickname=")
    expect(url).toContain("config=v2.rich-history")
    expect(url).not.toContain("eyJ2ZXJzaW9u")
  })

  it("falls back when an old link references a removed preset", () => {
    expect(deserializeConfig("v2.elo-level").preset).toBe("elo-pill")
    expect(deserializeConfig("v2.stream-card").preset).toBe("elo-pill")
  })
})
