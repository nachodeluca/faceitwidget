import { beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("cloudflare:workers", () => ({
  DurableObject: class {
    constructor(
      public ctx: unknown,
      public env: unknown,
    ) {}
  },
}))

vi.mock("./faceit/normalize", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./faceit/normalize")>()),
  fetchPlayerFacts: vi.fn(),
}))

import { fetchPlayerFacts, type PlayerFacts } from "./faceit/normalize"
import { PlayerSnapshotCoordinator } from "./snapshot-coordinator"

const lookup = { kind: "nickname", value: "nexoonszx090" } as const

function facts(played: number): PlayerFacts {
  return {
    playerId: "player-1",
    baseData: {
      profile: { nickname: lookup.value },
      rank: { status: "unranked", level: 0, elo: 0, placements: { played, total: 10 } },
    },
    matches: [{ matchId: "final-match" }],
    latestMatchId: "final-match",
    generatedAt: Date.now(),
    revision: `placements-${played}`,
  }
}

function coordinator(initialFacts: PlayerFacts) {
  let state = {
    version: 3,
    lookup,
    facts: initialFacts,
    fullFetchedAt: Date.now(),
    historyCheckedAt: Date.now(),
    stale: false,
    eloHistory: [{ observedAt: Date.now() - 1_000, elo: 2_327 }],
    pendingMatch: { matchId: "final-match", retryIndex: 0 } as
      | { matchId: string; retryIndex: number }
      | undefined,
  }
  const storage = {
    get: vi.fn(async () => state),
    put: vi.fn(async (_key: string, next: typeof state) => {
      state = next
    }),
    setAlarm: vi.fn(async () => {}),
  }
  const instance = new PlayerSnapshotCoordinator(
    { storage } as never,
    { FACEIT_DATA_API_KEY: "server-key" } as never,
  )
  return { instance, storage, state: () => state }
}

describe("placement refreshes", () => {
  beforeEach(() => vi.clearAllMocks())

  it.each([9, 10])(
    "keeps retrying the final match while FACEIT reports %s/10 Unranked",
    async (played) => {
      const saved = coordinator(facts(9))
      vi.mocked(fetchPlayerFacts).mockResolvedValue(facts(played))
      await saved.instance.alarm()
      expect(saved.storage.setAlarm).toHaveBeenCalledWith(expect.any(Number))
      expect(saved.state().pendingMatch?.retryIndex).toBe(1)
      expect(saved.state().eloHistory).toEqual([])
    },
  )

  it("finishes retrying and starts a new ELO baseline when the rank is published", async () => {
    const saved = coordinator(facts(10))
    vi.mocked(fetchPlayerFacts).mockResolvedValue({
      ...facts(10),
      baseData: {
        profile: { nickname: lookup.value },
        rank: { status: "ranked", level: 4, elo: 1_000 },
      },
    })
    await saved.instance.alarm()
    expect(saved.storage.setAlarm).not.toHaveBeenCalled()
    expect(saved.state().pendingMatch).toBeUndefined()
    expect(saved.state().facts.baseData.rank.status).toBe("ranked")
    expect(saved.state().eloHistory).toEqual([{ observedAt: expect.any(Number), elo: 1_000 }])
  })

  it("does not retry ordinary placement updates once the stats are available", async () => {
    const saved = coordinator(facts(5))
    vi.mocked(fetchPlayerFacts).mockResolvedValue(facts(6))
    await saved.instance.alarm()
    expect(saved.storage.setAlarm).not.toHaveBeenCalled()
    expect(saved.state().pendingMatch).toBeUndefined()
  })

  it("ends bounded retries and lets the periodic refresh recover the rank", async () => {
    const saved = coordinator(facts(10))
    vi.mocked(fetchPlayerFacts).mockResolvedValue(facts(10))
    for (let index = 0; index < 5; index++) await saved.instance.alarm()
    expect(saved.storage.setAlarm).toHaveBeenCalledTimes(4)
    expect(saved.state().pendingMatch).toBeUndefined()
    expect(saved.state().stale).toBe(true)
  })
})
