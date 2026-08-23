import { describe, expect, it } from "vitest"

import { createDefaultConfig, normalizeConfig } from "./config"
import { buildWidgetUrl, deserializeConfig, serializeConfig } from "./serialization"

function legacyToken(value: unknown) {
  return Buffer.from(JSON.stringify(value), "utf8").toString("base64url")
}

describe("widget config serialization", () => {
  it("uses a preset-only token when the config matches its defaults", () => {
    const config = createDefaultConfig("rich-profile")

    expect(serializeConfig(config)).toBe("v2.rich-profile")
    expect(deserializeConfig("v2.rich-profile")).toEqual(config)
  })

  it("round-trips custom visibility, style, and motion settings", () => {
    const defaults = createDefaultConfig("rich-profile")
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
    const config = createDefaultConfig("rich-profile")

    expect(deserializeConfig(legacyToken(config))).toEqual(config)
  })

  it("round-trips a selected backdrop and focal point", () => {
    const config = normalizeConfig({
      preset: "rank-elo",
      backdrop: { id: "ambient-03", position: { x: 24, y: 76 } },
    })
    const serialized = serializeConfig(config)

    expect(serialized).not.toBe("v2.rank-elo")
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
      "donk666",
      createDefaultConfig("rich-profile"),
      "America/Montevideo",
    )

    expect(url).toContain("config=v2.rich-profile")
    expect(url).not.toContain("eyJ2ZXJzaW9u")
  })

  it("falls back when an old link references a removed preset", () => {
    expect(deserializeConfig("v2.elo-level").preset).toBe("elo-pill")
    expect(deserializeConfig("v2.stream-card").preset).toBe("elo-pill")
  })

  it("maps the removed Last 30 preset to Rich Profile", () => {
    const config = createDefaultConfig("rich-profile")

    expect(deserializeConfig("v2.rich-history")).toEqual(config)
    expect(deserializeConfig(`v2.${legacyToken({ v: 2, p: "rich-history" })}`)).toEqual(config)
    expect(normalizeConfig({ ...config, preset: "rich-history" }).preset).toBe("rich-profile")
  })
})
