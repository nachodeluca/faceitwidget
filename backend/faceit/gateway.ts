import { z, type ZodType } from "zod"

import { ApiError } from "../errors"
import {
  faceitHistorySchema,
  faceitLifetimeSchema,
  faceitMatchStatsSchema,
  faceitPlayerSchema,
  faceitRankingSchema,
  type FaceitHistory,
  type FaceitLifetime,
  type FaceitMatchStats,
  type FaceitPlayer,
  type FaceitRanking,
} from "./schemas"

const FACEIT_API_URL = "https://open.faceit.com/data/v4"
const DEFAULT_TIMEOUT_MS = 5_000

export type HttpFetcher = (
  input: RequestInfo | URL,
  init?: RequestInit,
) => Promise<Response>

const globalFetcher: HttpFetcher = (input, init) => fetch(input, init)

function retryAfterMs(response: Response) {
  const value = response.headers.get("Retry-After")
  if (!value) return undefined
  const seconds = Number(value)
  if (Number.isFinite(seconds)) return Math.max(0, seconds * 1000)
  const date = Date.parse(value)
  return Number.isFinite(date) ? Math.max(0, date - Date.now()) : undefined
}

export class FaceitGateway {
  constructor(
    private readonly apiKey: string,
    private readonly fetcher: HttpFetcher = globalFetcher,
  ) {}

  private async get<T>(path: string, schema: ZodType<T>): Promise<T> {
    const response = await this.fetcher(`${FACEIT_API_URL}${path}`, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${this.apiKey}`,
        "User-Agent": "faceitwidget.com",
      },
      signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS),
    }).catch((cause) => {
      throw new ApiError(503, "FACEIT did not respond in time.", 15_000, { cause })
    })

    if (!response.ok) {
      const status = response.status === 429 || response.status >= 500 ? 503 : response.status
      throw new ApiError(
        status,
        response.status === 404
          ? "FACEIT player or CS2 profile not found."
          : "FACEIT rejected the stats request.",
        retryAfterMs(response),
      )
    }

    try {
      return schema.parse(await response.json())
    } catch (cause) {
      if (cause instanceof z.ZodError) {
        throw new ApiError(503, "FACEIT returned an unsupported response.", 30_000, { cause })
      }
      throw cause
    }
  }

  getPlayerByNickname(nickname: string): Promise<FaceitPlayer> {
    const params = new URLSearchParams({ nickname, game: "cs2" })
    return this.get(`/players?${params}`, faceitPlayerSchema)
  }

  getPlayerById(playerId: string): Promise<FaceitPlayer> {
    return this.get(`/players/${encodeURIComponent(playerId)}`, faceitPlayerSchema)
  }

  getLifetime(playerId: string): Promise<FaceitLifetime> {
    return this.get(`/players/${encodeURIComponent(playerId)}/stats/cs2`, faceitLifetimeSchema)
  }

  getMatchStats(playerId: string): Promise<FaceitMatchStats> {
    return this.get(
      `/players/${encodeURIComponent(playerId)}/games/cs2/stats?limit=100`,
      faceitMatchStatsSchema,
    )
  }

  getHistory(playerId: string, limit = 1): Promise<FaceitHistory> {
    return this.get(
      `/players/${encodeURIComponent(playerId)}/history?game=cs2&limit=${limit}`,
      faceitHistorySchema,
    )
  }

  getRanking(playerId: string, region: string, country?: string): Promise<FaceitRanking> {
    const suffix = country ? `?country=${encodeURIComponent(country)}` : ""
    return this.get(
      `/rankings/games/cs2/regions/${encodeURIComponent(region)}/players/${encodeURIComponent(playerId)}${suffix}`,
      faceitRankingSchema,
    )
  }
}
