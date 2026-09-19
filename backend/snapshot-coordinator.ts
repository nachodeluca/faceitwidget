import { DurableObject } from "cloudflare:workers"

import { isValidTimezone, parsePlayerLookup } from "../lib/widget/data/player-lookup"
import type { PlayerLookup } from "../lib/widget/types"
import { ApiError, errorResponse } from "./errors"
import { FaceitGateway } from "./faceit/gateway"
import { rememberElo, type EloObservation } from "./faceit/elo"
import {
  createWidgetSnapshot,
  fetchLatestMatchId,
  fetchPlayerFacts,
  type PlayerFacts,
} from "./faceit/normalize"
import type { WorkerEnv } from "./env"

const STATE_VERSION = 3
const STATE_KEY = `player-state-v${STATE_VERSION}`
const SNAPSHOT_TTL_MS = 5 * 60_000
const RETRY_DELAYS_MS = [15_000, 30_000, 60_000, 120_000] as const

type PendingMatch = {
  matchId: string
  retryIndex: number
}

type CoordinatorState = {
  version: typeof STATE_VERSION
  lookup: PlayerLookup
  facts: PlayerFacts
  fullFetchedAt: number
  historyCheckedAt: number
  stale: boolean
  eloHistory: EloObservation[]
  pendingMatch?: PendingMatch
}

function requestInput(request: Request) {
  const url = new URL(request.url)
  const lookup = parsePlayerLookup(url.searchParams.get("lookup") ?? "")
  const timezone = url.searchParams.get("tz") ?? "UTC"

  if (!lookup) throw new ApiError(400, "Enter a valid FACEIT nickname or player ID.")
  if (!isValidTimezone(timezone)) throw new ApiError(400, "Enter a valid IANA timezone.")

  return { lookup, timezone }
}

export class PlayerSnapshotCoordinator extends DurableObject<WorkerEnv> {
  private operation?: Promise<CoordinatorState>

  private gateway() {
    if (!this.env.FACEIT_DATA_API_KEY) {
      throw new ApiError(503, "FACEIT_DATA_API_KEY is not configured.")
    }
    return new FaceitGateway(this.env.FACEIT_DATA_API_KEY)
  }

  private refreshInterval() {
    const configured = Number(this.env.PLAYER_REFRESH_INTERVAL_MS)
    return Number.isFinite(configured)
      ? Math.min(300_000, Math.max(60_000, configured))
      : 120_000
  }

  private async storedState() {
    return this.ctx.storage.get<CoordinatorState>(STATE_KEY)
  }

  private async saveState(state: CoordinatorState) {
    await this.ctx.storage.put(STATE_KEY, state)
    return state
  }

  private runOnce(operation: () => Promise<CoordinatorState>) {
    if (!this.operation) {
      this.operation = operation().finally(() => {
        this.operation = undefined
      })
    }
    return this.operation
  }

  private refresh(lookup: PlayerLookup, previous?: CoordinatorState) {
    return this.runOnce(async () => {
      try {
        const facts = await fetchPlayerFacts(this.gateway(), lookup)
        const observedAt = Date.now()
        return this.saveState({
          version: STATE_VERSION,
          lookup,
          facts,
          fullFetchedAt: Date.now(),
          historyCheckedAt: Date.now(),
          stale: false,
          eloHistory: rememberElo(previous?.eloHistory, {
            observedAt,
            elo: facts.baseData.rank.elo,
          }),
        })
      } catch (error) {
        if (!previous) throw error
        return this.saveState({ ...previous, stale: true })
      }
    })
  }

  private async checkHistory(state: CoordinatorState) {
    try {
      const latestMatchId = await fetchLatestMatchId(this.gateway(), state.facts.playerId)
      const changed = latestMatchId && latestMatchId !== state.facts.latestMatchId
      const nextState: CoordinatorState = {
        ...state,
        historyCheckedAt: Date.now(),
        stale: false,
        pendingMatch: changed
          ? { matchId: latestMatchId, retryIndex: 0 }
          : state.pendingMatch,
      }
      await this.saveState(nextState)
      if (changed) await this.ctx.storage.setAlarm(Date.now() + 10_000)
      return nextState
    } catch {
      return this.saveState({ ...state, historyCheckedAt: Date.now(), stale: true })
    }
  }

  private async ensureState(lookup: PlayerLookup) {
    let state = await this.storedState()

    if (!state) return this.refresh(lookup)

    const now = Date.now()
    if (now - state.fullFetchedAt >= SNAPSHOT_TTL_MS && !state.pendingMatch) {
      state = await this.refresh(state.lookup, state)
    }
    if (now - state.historyCheckedAt >= this.refreshInterval() && !state.pendingMatch) {
      state = await this.checkHistory(state)
    }

    return state
  }

  private snapshot(state: CoordinatorState, timezone: string) {
    return createWidgetSnapshot(state.facts, timezone, {
      stale: state.stale,
      refreshAfterMs: this.refreshInterval(),
      eloHistory: state.eloHistory,
    })
  }

  private async snapshotResponse(request: Request) {
    const { lookup, timezone } = requestInput(request)
    const state = await this.ensureState(lookup)
    const snapshot = this.snapshot(state, timezone)
    const etagTimezone = timezone.replace(/[^a-z0-9]/gi, "-")
    const freshness = snapshot.meta.stale ? "stale" : "fresh"
    const etag = `W/"${snapshot.meta.revision}-${freshness}-${etagTimezone}"`

    if (request.headers.get("If-None-Match") === etag) {
      return new Response(null, { status: 304, headers: { ETag: etag } })
    }

    return Response.json(snapshot, {
      headers: {
        "Cache-Control": "private, no-store",
        ETag: etag,
      },
    })
  }

  async fetch(request: Request) {
    try {
      const path = new URL(request.url).pathname
      if (path === "/snapshot") return await this.snapshotResponse(request)
      throw new ApiError(404, "Unknown player snapshot route.")
    } catch (error) {
      return errorResponse(error)
    }
  }

  async alarm() {
    const state = await this.storedState()
    if (!state?.pendingMatch) return

    const pendingMatch = state.pendingMatch
    const refreshed = await this.refresh(state.lookup, state)
    const statsReady = refreshed.facts.matches.some((match) => match.matchId === pendingMatch.matchId)

    if (statsReady) return

    const retryDelay = RETRY_DELAYS_MS[pendingMatch.retryIndex]
    if (retryDelay === undefined) {
      await this.saveState({ ...refreshed, stale: true, pendingMatch: undefined })
      return
    }

    await this.saveState({
      ...refreshed,
      stale: refreshed.stale,
      pendingMatch: { ...pendingMatch, retryIndex: pendingMatch.retryIndex + 1 },
    })
    await this.ctx.storage.setAlarm(Date.now() + retryDelay)
  }
}
