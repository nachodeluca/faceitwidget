import { describe, expect, it } from "vitest"

import { getWinRateTone } from "./stat-tone"

describe("getWinRateTone", () => {
  it.each([
    [0, "negative"],
    [20, "negative"],
    [21, "default"],
    [50, "default"],
    [51, "positive"],
    [100, "positive"],
    [undefined, "default"],
  ] as const)("maps %s to %s", (winRate, tone) => {
    expect(getWinRateTone(winRate)).toBe(tone)
  })
})
