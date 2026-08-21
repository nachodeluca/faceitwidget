import { describe, expect, it } from "vitest"

import {
  createWidgetSnapshot,
  normalizeLifetime,
  normalizeMatch,
  type PlayerFacts,
} from "./normalize"

describe("normalizeMatch", () => {
  it("normalizes FACEIT's dynamic stat names", () => {
    expect(normalizeMatch({
      "Match Id": "match-1",
      "Match Finished At": "1787287269000",
      Result: "1",
      Kills: "23",
      Deaths: "15",
      "K/D Ratio": "1.53",
      "K/R Ratio": "0.84",
      ADR: "104.3",
    })).toEqual({
      matchId: "match-1",
      finishedAt: 1787287269000,
      won: true,
      kills: 23,
      deaths: 15,
      kd: 1.53,
      kr: 0.84,
      adr: 104.3,
    })
  })
})

describe("normalizeLifetime", () => {
  it("prefers FACEIT's average K/D over its cumulative K/D field", () => {
    expect(normalizeLifetime({
      "K/D Ratio": "10437.84",
      "Average K/D Ratio": "1.45",
    })).toEqual({ kdr: 1.45 })
  })

  it("rejects impossible cumulative values when the average is unavailable", () => {
    expect(normalizeLifetime({ "K/D Ratio": "10437.84" })).toEqual({ kdr: undefined })
  })
})

describe("createWidgetSnapshot", () => {
  it("derives today and last-30 stats without changing base data", () => {
    const now = Date.now()
    const facts: PlayerFacts = {
      playerId: "player-1",
      baseData: {
        profile: { nickname: "donk666", countryCode: "ru" },
        rank: { level: 10, elo: 4075, worldRank: 1, isChallenger: true },
        lifetime: { kdr: 1.46 },
      },
      matches: [
        { matchId: "new", finishedAt: now, won: true, kills: 20, kd: 2, kr: 1, adr: 100 },
        {
          matchId: "old",
          finishedAt: now - 48 * 60 * 60 * 1000,
          won: false,
          kills: 10,
          kd: 1,
          kr: 0.5,
          adr: 50,
        },
      ],
      latestMatchId: "new",
      generatedAt: now,
      revision: "revision-1",
    }

    const snapshot = createWidgetSnapshot(facts, "UTC", {
      stale: false,
      refreshAfterMs: 30_000,
    })

    expect(snapshot.data.today).toMatchObject({ wins: 1, losses: 0, avgKills: 20 })
    expect(snapshot.data.last30).toMatchObject({
      winRate: 50,
      avgKills: 15,
      avgKD: 1.5,
      avgKR: 0.75,
      adr: 75,
    })
    expect(snapshot.data.last5Results).toEqual(["win", "loss"])
    expect(snapshot.meta).toMatchObject({
      playerId: "player-1",
      revision: "revision-1",
      latestMatchId: "new",
      stale: false,
    })
  })
})
