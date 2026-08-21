import { describe, expect, it, vi } from "vitest"

import { ApiError } from "../errors"
import { FaceitGateway } from "./gateway"

const playerResponse = {
  player_id: "player-1",
  nickname: "donk666",
  games: { cs2: { faceit_elo: 4000, skill_level: 10, region: "EU" } },
}

describe("FaceitGateway", () => {
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

  it("turns FACEIT rate limits into a retryable service error", async () => {
    const fetcher = vi.fn(async () => new Response(null, {
      status: 429,
      headers: { "Retry-After": "2" },
    }))
    const gateway = new FaceitGateway("server-key", fetcher)

    const request = gateway.getPlayerByNickname("donk666")
    await expect(request).rejects.toMatchObject({ status: 503, retryAfterMs: 2_000 } satisfies Partial<ApiError>)
  })
})
