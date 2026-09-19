import { z } from "zod"

import type { WidgetDataSource } from "./data-source"
import type { WidgetSnapshot } from "../types"

const widgetDataSchema = z.object({
  profile: z.object({
    nickname: z.string(),
    avatarUrl: z.string().optional(),
    countryCode: z.string().optional(),
  }),
  rank: z.object({
    level: z.number(),
    elo: z.number(),
    eloChange: z.number().optional(),
    worldRank: z.number().optional(),
    regionRank: z.number().optional(),
    countryRank: z.number().optional(),
    isChallenger: z.boolean().optional(),
  }),
  lifetime: z.object({
    avgKills: z.number().optional(),
    headshotRate: z.number().optional(),
    kdr: z.number().optional(),
    kr: z.number().optional(),
  }).optional(),
  last30: z.object({
    winRate: z.number().optional(),
    avgKills: z.number().optional(),
    adr: z.number().optional(),
    avgKD: z.number().optional(),
    avgKR: z.number().optional(),
  }).optional(),
  last5Results: z.array(z.enum(["win", "loss"])).max(5).optional(),
  today: z.object({
    wins: z.number().optional(),
    losses: z.number().optional(),
    avgKills: z.number().optional(),
    avgKD: z.number().optional(),
    avgKR: z.number().optional(),
    adr: z.number().optional(),
  }).optional(),
})

const widgetSnapshotSchema = z.object({
  data: widgetDataSchema,
  meta: z.object({
    playerId: z.string(),
    revision: z.string(),
    generatedAt: z.string(),
    stale: z.boolean(),
    latestMatchId: z.string().optional(),
    refreshAfterMs: z.number(),
  }),
})

export class WidgetApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message)
    this.name = "WidgetApiError"
  }
}

function apiBaseUrl() {
  return process.env.NEXT_PUBLIC_WIDGET_API_BASE_URL?.replace(/\/$/, "") ?? ""
}

function apiUrl(lookup: string, timezone = "UTC") {
  const route = "snapshot"
  const path = `/api/v1/players/${encodeURIComponent(lookup)}/${route}`
  const url = new URL(`${apiBaseUrl()}${path}`, window.location.origin)
  url.searchParams.set("tz", timezone)
  return url
}

export class WidgetApiClient implements WidgetDataSource {
  private readonly snapshotCache = new Map<string, { etag: string; snapshot: WidgetSnapshot }>()

  async getPlayerSnapshot(
    lookup: string,
    options: { timezone?: string; signal?: AbortSignal } = {},
  ): Promise<WidgetSnapshot> {
    const headers = new Headers({ Accept: "application/json" })
    const cacheKey = `${lookup.toLowerCase()}:${options.timezone ?? "UTC"}`
    const cached = this.snapshotCache.get(cacheKey)
    if (cached) headers.set("If-None-Match", cached.etag)

    const response = await fetch(apiUrl(lookup, options.timezone), {
      headers,
      signal: options.signal,
    })

    if (response.status === 304 && cached) {
      return cached.snapshot
    }

    if (!response.ok) {
      const body = await response.json().catch(() => null) as { error?: string } | null
      throw new WidgetApiError(body?.error ?? "Unable to load FACEIT stats.", response.status)
    }

    const snapshot = widgetSnapshotSchema.parse(await response.json())
    const etag = response.headers.get("ETag")

    if (etag) {
      this.snapshotCache.delete(cacheKey)
      this.snapshotCache.set(cacheKey, { etag, snapshot })

      const oldestKey = this.snapshotCache.keys().next().value
      if (this.snapshotCache.size > 20 && oldestKey) {
        this.snapshotCache.delete(oldestKey)
      }
    }

    return snapshot
  }

}

export const widgetApiClient = new WidgetApiClient()
