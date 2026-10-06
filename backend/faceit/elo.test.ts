import { describe, expect, it } from "vitest"

import { dailyEloChange, rememberElo } from "./elo"

describe("dailyEloChange", () => {
  const now = Date.parse("2026-08-21T15:00:00Z")

  it("compares the current ELO with the last observation before today", () => {
    const history = [
      { observedAt: Date.parse("2026-08-20T23:00:00Z"), elo: 4_000 },
      { observedAt: Date.parse("2026-08-21T10:00:00Z"), elo: 4_020 },
    ]

    expect(dailyEloChange(history, 4_030, now, "UTC")).toBe(30)
  })

  it("starts tracking from the first observation when yesterday is unknown", () => {
    const history = [{ observedAt: Date.parse("2026-08-21T10:00:00Z"), elo: 4_020 }]

    expect(dailyEloChange(history, 4_010, now, "UTC")).toBe(-10)
  })

  it("does not report the hidden placement ELO as a loss", () => {
    expect(dailyEloChange([{ observedAt: now - 1_000, elo: 2_327 }], 0, now, "UTC")).toBeUndefined()
  })

  it("ignores old seasons and hidden zeroes in existing stored histories", () => {
    const history = [
      { observedAt: now - 2_000, elo: 2_327 },
      { observedAt: now - 1_000, elo: 0 },
    ]
    expect(dailyEloChange(history, 2_100, now, "UTC")).toBe(0)
    expect(
      dailyEloChange([...history, { observedAt: now, elo: 2_100 }], 2_120, now + 1_000, "UTC"),
    ).toBe(20)
  })
})

describe("rememberElo", () => {
  it("resets the ranked ELO history during placements", () => {
    const now = Date.now()
    const history = rememberElo([{ observedAt: now - 1_000, elo: 2_327 }], {
      observedAt: now,
      elo: 0,
    })
    expect(history).toEqual([])
    expect(rememberElo(history, { observedAt: now + 1_000, elo: 2_100 })).toEqual([
      { observedAt: now + 1_000, elo: 2_100 },
    ])
  })
  it("keeps recent observations bounded", () => {
    const now = Date.parse("2026-08-21T15:00:00Z")
    const history = rememberElo([{ observedAt: now - 4 * 24 * 60 * 60 * 1_000, elo: 4_000 }], {
      observedAt: now,
      elo: 4_030,
    })

    expect(history).toEqual([{ observedAt: now, elo: 4_030 }])
  })
})
