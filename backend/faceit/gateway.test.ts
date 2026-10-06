import { describe, expect, it, vi } from "vitest"

import type { ApiError } from "../errors"
import { FaceitGateway } from "./gateway"

const playerResponse = {
  player_id: "player-1",
  nickname: "donk666",
  games: { cs2: { faceit_elo: 4000, skill_level: 10, region: "EU" } },
}

describe("FaceitGateway", () => {
  it("fetches placements by UUID without forwarding the Data API key", async () => {
    const fetcher = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = new URL(String(input))
      expect(url.pathname).toBe("/api/skills/v4/skills")
      expect(url.searchParams.get("user_ids[]")).toBe("player-uuid")
      expect(url.searchParams.get("game")).toBe("cs2")
      expect(new Headers(init?.headers).get("Authorization")).toBeNull()
      expect(new Headers(init?.headers).get("Cookie")).toBeNull()
      expect(init?.signal).toBeInstanceOf(AbortSignal)
      return Response.json({
        payload: [
          { user_id: "another-player", game_skill: { level: 10, value: 3_000 } },
          {
            user_id: "player-uuid",
            calibrating: { active: true, target: 10, matches_remaining: 4 },
          },
        ],
      })
    })
    expect(await new FaceitGateway("server-key", fetcher).getSkill("player-uuid")).toMatchObject({
      playerId: "player-uuid",
      calibrating: { active: true, target: 10, matchesRemaining: 4 },
    })
  })

  it("does not use skill data belonging to another UUID", async () => {
    const fetcher = vi.fn(async () =>
      Response.json({
        payload: [{ user_id: "another-player", game_skill: { level: 10, value: 3_000 } }],
      }),
    )
    await expect(
      new FaceitGateway("server-key", fetcher).getSkill("player-uuid"),
    ).resolves.toBeUndefined()
  })

  it.each([403, 429, 503])("makes skill endpoint failures retryable: %s", async (status) => {
    const fetcher = vi.fn(
      async () => new Response(null, { status, headers: { "Retry-After": "2" } }),
    )
    await expect(
      new FaceitGateway("server-key", fetcher).getSkill("player-uuid"),
    ).rejects.toMatchObject({ status: 503, retryAfterMs: 2_000 })
  })

  it("does not rebind the global fetch function", async () => {
    vi.stubGlobal("fetch", function (this: unknown) {
      if (this instanceof FaceitGateway) {
        throw new TypeError("fetch was rebound to FaceitGateway")
      }
      return Promise.resolve(Response.json(playerResponse))
    })

    const gateway = new FaceitGateway("server-key")

    try {
      await expect(gateway.getPlayerByNickname("donk666")).resolves.toMatchObject(playerResponse)
    } finally {
      vi.unstubAllGlobals()
    }
  })

  it("keeps the application key in the server request", async () => {
    let requestedUrl = ""
    const fetcher = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      requestedUrl = String(input)
      expect(new Headers(init?.headers).get("Authorization")).toBe("Bearer server-key")
      return Response.json(playerResponse)
    })
    const gateway = new FaceitGateway("server-key", fetcher)

    await expect(gateway.getPlayerByNickname("donk666")).resolves.toMatchObject(playerResponse)
    expect(requestedUrl).toContain("nickname=donk666")
  })

  it("looks up verification level by UUID without sending the Data API key", async () => {
    let requestedUrl = ""
    const fetcher = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      requestedUrl = String(input)
      expect(new Headers(init?.headers).get("Authorization")).toBeNull()
      return Response.json({
        result: "OK",
        payload: { current: 3, timestamp: "2023-10-06T14:43:07.640Z" },
      })
    })
    const gateway = new FaceitGateway("server-key", fetcher)

    await expect(gateway.getVerificationLevel("player-uuid")).resolves.toBe(3)
    expect(requestedUrl).toBe("https://www.faceit.com/api/verifications/v1/users/player-uuid/level")
  })

  it("turns FACEIT rate limits into a retryable service error", async () => {
    const fetcher = vi.fn(
      async () =>
        new Response(null, {
          status: 429,
          headers: { "Retry-After": "2" },
        }),
    )
    const gateway = new FaceitGateway("server-key", fetcher)

    const request = gateway.getPlayerByNickname("donk666")
    await expect(request).rejects.toMatchObject({
      status: 503,
      retryAfterMs: 2_000,
    } satisfies Partial<ApiError>)
  })
})
