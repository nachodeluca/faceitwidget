import { DurableObject } from "cloudflare:workers"

import { isValidTimezone, parsePlayerLookup } from "../lib/widget/data/player-lookup"
import type { PlayerLookup, WidgetLiveMessage } from "../lib/widget/types"
import { ApiError, errorResponse } from "./errors"
import { FaceitGateway } from "./faceit/gateway"
import {
  createWidgetSnapshot,
  fetchLatestMatchId,
  fetchPlayerFacts,
  type PlayerFacts,
} from "./faceit/normalize"
import type { WorkerEnv } from "./env"

const STATE_VERSION = 2
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
  pendingMatch?: PendingMatch
}

type SocketAttachment = {
  timezone: string
}

function requestInput(request: Request) {
  const url = new URL(request.url)
  const lookup = parsePlayerLookup(url.searchParams.get("lookup") ?? "")
  const timezone = url.searchParams.get("tz") ?? "UTC"

  if (!lookup) throw new ApiError(400, "Enter a valid FACEIT nickname or player ID.")
  if (!isValidTimezone(timezone)) throw new ApiError(400, "Enter a valid IANA timezone.")

  return { lookup, timezone }
}

function socketIsOpen(socket: WebSocket) {
  return socket.readyState === WebSocket.OPEN
}

export class PlayerSnapshotCoordinator extends DurableObject<WorkerEnv> {
  private operation?: Promise<CoordinatorState>

  private gateway() {
    if (!this.env.FACEIT_DATA_API_KEY) {
      throw new ApiError(503, "FACEIT_DATA_API_KEY is not configured.")
    }
    return new FaceitGateway(this.env.FACEIT_DATA_API_KEY)
  }

  private pollInterval() {
    const configured = Number(this.env.LIVE_POLL_INTERVAL_MS)
    return Number.isFinite(configured)
      ? Math.min(60_000, Math.max(15_000, configured))
      : 30_000
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
        return this.saveState({
          version: STATE_VERSION,
          lookup,
          facts,
          fullFetchedAt: Date.now(),
          historyCheckedAt: Date.now(),
          stale: false,
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
    if (now - state.historyCheckedAt >= this.pollInterval() && !state.pendingMatch) {
      state = await this.checkHistory(state)
    }

    return state
  }

  private snapshot(state: CoordinatorState, timezone: string) {
    return createWidgetSnapshot(state.facts, timezone, {
      stale: state.stale,
      refreshAfterMs: this.pollInterval(),
    })
  }

  private send(socket: WebSocket, message: WidgetLiveMessage) {
    if (!socketIsOpen(socket)) return
    try {
      socket.send(JSON.stringify(message))
    } catch {
      socket.close(1011, "send failed")
    }
  }

  private broadcastStatus(state: WidgetLiveMessage & { type: "status" }) {
    for (const socket of this.ctx.getWebSockets()) this.send(socket, state)
  }

  private broadcastSnapshot(state: CoordinatorState) {
    for (const socket of this.ctx.getWebSockets()) {
      const attachment = socket.deserializeAttachment() as SocketAttachment | null
      const timezone = attachment?.timezone ?? "UTC"
      this.send(socket, { type: "snapshot", payload: this.snapshot(state, timezone) })
    }
  }

  private hasClients() {
    return this.ctx.getWebSockets().some(socketIsOpen)
  }

  private async schedulePoll() {
    if (this.hasClients()) {
      await this.ctx.storage.setAlarm(Date.now() + this.pollInterval())
    }
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

  private async liveResponse(request: Request) {
    if (request.headers.get("Upgrade")?.toLowerCase() !== "websocket") {
      throw new ApiError(426, "This endpoint requires a WebSocket upgrade.")
    }

    const { lookup, timezone } = requestInput(request)
    const state = await this.ensureState(lookup)
    const pair = new WebSocketPair()
    const [client, server] = Object.values(pair)
    server.serializeAttachment({ timezone } satisfies SocketAttachment)
    this.ctx.acceptWebSocket(server)
    this.send(server, { type: "status", state: state.stale ? "stale" : "connected" })
    this.send(server, { type: "snapshot", payload: this.snapshot(state, timezone) })
    await this.schedulePoll()

    return new Response(null, { status: 101, webSocket: client })
  }

  async fetch(request: Request) {
    try {
      const path = new URL(request.url).pathname
      if (path === "/snapshot") return await this.snapshotResponse(request)
      if (path === "/live") return await this.liveResponse(request)
      throw new ApiError(404, "Unknown player snapshot route.")
    } catch (error) {
      return errorResponse(error)
    }
  }

  async alarm() {
    if (!this.hasClients()) return
    const state = await this.storedState()
    if (!state) return

    if (!state.pendingMatch) {
      const checked = await this.checkHistory(state)
      if (checked.pendingMatch) {
        this.broadcastStatus({ type: "status", state: "syncing" })
        return
      }
      if (checked.stale) this.broadcastStatus({ type: "status", state: "stale" })
      await this.schedulePoll()
      return
    }

    const pendingMatch = state.pendingMatch
    const refreshed = await this.refresh(state.lookup, state)
    const statsReady = refreshed.facts.matches.some((match) => match.matchId === pendingMatch.matchId)

    if (statsReady) {
      this.broadcastSnapshot(refreshed)
      await this.schedulePoll()
      return
    }

    const retryDelay = RETRY_DELAYS_MS[pendingMatch.retryIndex]
    if (retryDelay === undefined) {
      const stopped = await this.saveState({ ...state, stale: true, pendingMatch: undefined })
      this.broadcastStatus({ type: "status", state: "stale" })
      this.broadcastSnapshot(stopped)
      await this.schedulePoll()
      return
    }

    await this.saveState({
      ...state,
      stale: refreshed.stale,
      pendingMatch: { ...pendingMatch, retryIndex: pendingMatch.retryIndex + 1 },
    })
    await this.ctx.storage.setAlarm(Date.now() + retryDelay)
  }

  webSocketMessage(socket: WebSocket, message: string | ArrayBuffer) {
    if (message === "ping") socket.send("pong")
  }

  webSocketError(socket: WebSocket) {
    socket.close(1011, "connection error")
  }
}
