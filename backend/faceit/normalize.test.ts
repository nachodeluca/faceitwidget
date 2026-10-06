import { describe, expect, it, vi } from "vitest"
import type { FaceitGateway } from "./gateway"
import {
  createWidgetSnapshot,
  fetchPlayerFacts,
  normalizeLifetime,
  normalizeMatch,
  type PlayerFacts,
} from "./normalize"
import type { FaceitSkill } from "./schemas"

describe("normalizeMatch", () => {
  it("normalizes FACEIT's dynamic stat names", () => {
    expect(
      normalizeMatch({
        "Match Id": "match-1",
        "Match Finished At": "1787287269000",
        Result: "1",
        Kills: "23",
        Deaths: "15",
        "K/D Ratio": "1.53",
        "K/R Ratio": "0.84",
        ADR: "104.3",
      }),
    ).toEqual({
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
  it("keeps the regional ranking and region code from FACEIT", async () => {
    const getVerificationLevel = async () => 2
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
      getSkill: async () => undefined,
      getVerificationLevel,
      getRegionalRanking: async (_playerId: string, _region: string, country?: string) => ({
        position: country ? 38 : 2_350,
      }),
    } as unknown as FaceitGateway

    const facts = await fetchPlayerFacts(gateway, { kind: "nickname", value: "nachete" })

    expect(facts.baseData.rank.regionRank).toBe(2_350)
    expect(facts.baseData.profile.regionCode).toBe("SA")
    expect(facts.baseData.profile.verifiedBadge).toBe("verified")
  })

  it("uses the UUID resolved from a nickname and ignores verification endpoint failures", async () => {
    const getVerificationLevel = async (playerId: string) => {
      expect(playerId).toBe("player-1")
      throw new Error("verification endpoint unavailable")
    }
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
      getSkill: async () => undefined,
      getVerificationLevel,
      getRegionalRanking: async () => ({ position: 10 }),
    } as unknown as FaceitGateway

    const facts = await fetchPlayerFacts(gateway, { kind: "nickname", value: "nachete" })

    expect(facts.playerId).toBe("player-1")
    expect(facts.baseData.profile.verifiedBadge).toBe("none")
    expect(facts.baseData.rank.elo).toBe(2_173)
  })

  it("keeps placement stats while omitting rankings until the rank is published", async () => {
    const getSkill = vi.fn<() => Promise<FaceitSkill | undefined>>(async () => ({
      playerId: "53f1f19d-782e-407b-8459-3a10e313d140",
      gameSkill: undefined,
      calibrating: { active: true, target: 10, matchesRemaining: 4 },
    }))
    const getRegionalRanking = vi.fn(async () => ({ position: 174 }))
    const gateway = {
      getPlayerByNickname: async () => ({
        player_id: "53f1f19d-782e-407b-8459-3a10e313d140",
        nickname: "nexoonszx090",
        country: "ru",
        games: { cs2: { region: "EU", skill_level: 0, faceit_elo: 0 } },
      }),
      getSkill,
      getRegionalRanking,
      getLifetime: async () => ({ lifetime: { "Average K/D Ratio": "0.92" } }),
      getMatchStats: async () => ({
        items: [{ stats: { "Match Id": "placement-6", Result: "1" } }],
      }),
      getHistory: async () => ({ items: [{ match_id: "placement-6" }] }),
      getVerificationLevel: async () => 0,
    } as unknown as FaceitGateway

    const lookup = { kind: "nickname", value: "nexoonszx090" } as const
    const facts = await fetchPlayerFacts(gateway, lookup)
    expect(getSkill).toHaveBeenCalledWith(facts.playerId)
    expect(getRegionalRanking).not.toHaveBeenCalled()
    expect(facts.baseData.rank).toMatchObject({
      status: "unranked",
      level: 0,
      elo: 0,
      placements: { played: 6, total: 10 },
      isChallenger: false,
    })
    expect(facts.baseData.rank.countryRank).toBeUndefined()
    expect(facts.baseData.rank.regionRank).toBeUndefined()
    expect(facts.baseData.lifetime?.kdr).toBe(0.92)
    expect(facts.matches[0]).toMatchObject({ matchId: "placement-6", won: true })

    getSkill.mockResolvedValueOnce({
      playerId: facts.playerId,
      gameSkill: { level: 4, value: 1_000 },
      calibrating: undefined,
    })
    const ranked = await fetchPlayerFacts(gateway, lookup)
    expect(ranked.baseData.rank).toMatchObject({
      status: "ranked",
      level: 4,
      elo: 1_000,
      regionRank: 174,
    })
    expect(ranked.baseData.rank.placements).toBeUndefined()

    getSkill.mockRejectedValueOnce(new Error("skill endpoint unavailable"))
    const fallback = await fetchPlayerFacts(gateway, lookup)
    expect(fallback.baseData.rank.status).toBe("unranked")
    expect(fallback.baseData.rank.placements).toBeUndefined()
  })
})

describe("normalizeLifetime", () => {
  it("prefers FACEIT's average K/D over its cumulative K/D field", () => {
    expect(
      normalizeLifetime({
        "K/D Ratio": "10437.84",
        "Average K/D Ratio": "1.45",
      }),
    ).toMatchObject({ kdr: 1.45 })
  })

  it("rejects impossible cumulative values when the average is unavailable", () => {
    expect(normalizeLifetime({ "K/D Ratio": "10437.84" })).toMatchObject({ kdr: undefined })
  })

  it("normalizes the lifetime performance fields", () => {
    expect(
      normalizeLifetime({
        "Average Kills": "18.4",
        "Average Headshots %": "47.5",
        "Average K/D Ratio": "1.45",
        "Average K/R Ratio": "0.84",
      }),
    ).toEqual({
      avgKills: 18.4,
      headshotRate: 47.5,
      kdr: 1.45,
      kr: 0.84,
    })
  })
})

describe("createWidgetSnapshot", () => {
  it("omits even a previously saved ELO change while Unranked", () => {
    const now = Date.now()
    const facts: PlayerFacts = {
      playerId: "player-1",
      baseData: {
        profile: { nickname: "nexoonszx090" },
        rank: {
          status: "unranked",
          level: 0,
          elo: 0,
          eloChange: -2_327,
          placements: { played: 6, total: 10 },
        },
      },
      matches: [{ finishedAt: now, won: true, kills: 21 }],
      generatedAt: now,
      revision: "placements",
    }
    const snapshot = createWidgetSnapshot(facts, "UTC", {
      stale: false,
      refreshAfterMs: 120_000,
      now,
      eloHistory: [{ observedAt: now - 1_000, elo: 2_327 }],
    })
    expect(snapshot.data.rank.eloChange).toBeUndefined()
    expect(snapshot.data.rank.placements).toEqual({ played: 6, total: 10 })
    expect(snapshot.data.today?.wins).toBe(1)
  })

  it("derives today and last-30 stats without changing base data", () => {
    const now = Date.now()
    const facts: PlayerFacts = {
      playerId: "player-1",
      baseData: {
        profile: { nickname: "donk666", countryCode: "ru" },
        rank: { level: 10, elo: 4075, regionRank: 1, isChallenger: true },
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
