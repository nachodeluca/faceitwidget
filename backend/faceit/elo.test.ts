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
})

describe("rememberElo", () => {
  it("keeps recent observations bounded", () => {
    const now = Date.parse("2026-08-21T15:00:00Z")
    const history = rememberElo(
      [{ observedAt: now - 4 * 24 * 60 * 60 * 1_000, elo: 4_000 }],
      { observedAt: now, elo: 4_030 },
    )

    expect(history).toEqual([{ observedAt: now, elo: 4_030 }])
  })
})
