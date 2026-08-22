import { describe, expect, it } from "vitest"

import {
  createWidgetSnapshot,
  fetchPlayerFacts,
  normalizeLifetime,
  normalizeMatch,
  type PlayerFacts,
} from "./normalize"
import type { FaceitGateway } from "./gateway"

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

describe("fetchPlayerFacts", () => {
  it("keeps one canonical ranking when FACEIT returns one ranking response", async () => {
    const gateway = {
      getPlayerByNickname: async () => ({
        player_id: "player-1",
        nickname: "nachete",
        country: "uy",
        games: { cs2: { region: "SA", skill_level: 10, faceit_elo: 2_173 } },
      }),
      getLifetime: async () => ({ lifetime: {} }),
      getMatchStats: async () => ({ items: [] }),
      getHistory: async () => ({ items: [] }),
      getRanking: async (_playerId: string, _region: string, country?: string) => ({
        position: country ? 38 : 2_350,
      }),
    } as unknown as FaceitGateway

    const facts = await fetchPlayerFacts(gateway, { kind: "nickname", value: "nachete" })

    expect(facts.baseData.rank.worldRank).toBe(2_350)
    expect(facts.baseData.rank.regionRank).toBeUndefined()
  })
})

describe("normalizeLifetime", () => {
  it("prefers FACEIT's average K/D over its cumulative K/D field", () => {
    expect(normalizeLifetime({
      "K/D Ratio": "10437.84",
      "Average K/D Ratio": "1.45",
    })).toMatchObject({ kdr: 1.45 })
  })

  it("rejects impossible cumulative values when the average is unavailable", () => {
    expect(normalizeLifetime({ "K/D Ratio": "10437.84" })).toMatchObject({ kdr: undefined })
  })

  it("normalizes the lifetime performance fields", () => {
    expect(normalizeLifetime({
      "Average Kills": "18.4",
      "Average Headshots %": "47.5",
      "Average K/D Ratio": "1.45",
      "Average K/R Ratio": "0.84",
    })).toEqual({
      avgKills: 18.4,
      headshotRate: 47.5,
      kdr: 1.45,
      kr: 0.84,
    })
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

  it("includes the observed daily ELO difference", () => {
    const now = Date.parse("2026-08-21T15:00:00Z")
    const facts: PlayerFacts = {
      playerId: "player-1",
      baseData: {
        profile: { nickname: "donk666" },
        rank: { level: 10, elo: 4_030 },
      },
      matches: [],
      generatedAt: now,
      revision: "revision-2",
    }

    const snapshot = createWidgetSnapshot(facts, "UTC", {
      stale: false,
      refreshAfterMs: 30_000,
      now,
      eloHistory: [{ observedAt: Date.parse("2026-08-20T23:00:00Z"), elo: 4_000 }],
    })

    expect(snapshot.data.rank.eloChange).toBe(30)
  })
})
