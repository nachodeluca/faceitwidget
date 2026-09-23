"use client"

import { useEffect, useReducer } from "react"

import { widgetApiClient, WidgetApiError } from "./api-client"
import { getBrowserTimezone, parsePlayerLookup, playerLookupKey } from "./player-lookup"
import type { WidgetData, WidgetSnapshot } from "../types"

const DEFAULT_REFRESH_INTERVAL_MS = 120_000

type PlayerSnapshotPendingState = {
  data: null
  status: "idle" | "loading"
  error?: undefined
  playerId?: undefined
}

type PlayerSnapshotErrorState = {
  data: null
  status: "error"
  error: string
  playerId?: undefined
}

export type PlayerSnapshotReadyState = {
  data: WidgetData
  playerId: string
  status: "connected" | "stale"
  error?: undefined
}

export type PlayerSnapshotState =
  | PlayerSnapshotPendingState
  | PlayerSnapshotErrorState
  | PlayerSnapshotReadyState

type StoredPlayerSnapshotState = PlayerSnapshotState & { lookupKey: string | null }

type SnapshotAction =
  | { type: "start"; lookupKey: string; preserveData: boolean }
  | { type: "snapshot"; lookupKey: string; snapshot: WidgetSnapshot }
  | { type: "failure"; lookupKey: string; message: string }

const idleState: PlayerSnapshotPendingState = { data: null, status: "idle" }

function snapshotReducer(
  state: StoredPlayerSnapshotState,
  action: SnapshotAction,
): StoredPlayerSnapshotState {
  if (action.type === "start") {
    const sameLookup = action.preserveData && state.lookupKey === action.lookupKey
    const retainedData = sameLookup ? state.data : null
    const retainedPlayerId = sameLookup ? state.playerId : undefined

    return retainedData && retainedPlayerId
      ? { data: retainedData, playerId: retainedPlayerId, status: "stale", lookupKey: action.lookupKey }
      : { data: null, status: "loading", lookupKey: action.lookupKey }
  }

  if (action.type === "snapshot") {
    return {
      data: action.snapshot.data,
      playerId: action.snapshot.meta.playerId,
      status: action.snapshot.meta.stale ? "stale" : "connected",
      lookupKey: action.lookupKey,
    }
  }

  if (state.lookupKey !== action.lookupKey) return state

  return state.data && state.playerId
    ? { data: state.data, playerId: state.playerId, status: "stale", lookupKey: action.lookupKey }
    : { data: null, status: "error", error: action.message, lookupKey: action.lookupKey }
}

function errorMessage(error: unknown) {
  return error instanceof WidgetApiError
    ? error.message
    : "Unable to load FACEIT stats."
}

function shouldRetry(error: unknown) {
  return !(error instanceof WidgetApiError) || error.status === 429 || error.status >= 500
}

function retryDelay(attempt: number) {
  return Math.min(30_000, 1_000 * 2 ** attempt)
}

function refreshDelay(snapshot: WidgetSnapshot) {
  return Number.isFinite(snapshot.meta.refreshAfterMs) && snapshot.meta.refreshAfterMs > 0
    ? snapshot.meta.refreshAfterMs
    : DEFAULT_REFRESH_INTERVAL_MS
}

export function usePlayerSnapshot(
  lookupValue: string,
  options: { debounceMs?: number; timezone?: string; telemetry?: boolean } = {},
): PlayerSnapshotState {
  const parsedLookup = parsePlayerLookup(lookupValue)
  const activeLookupKey = parsedLookup ? playerLookupKey(parsedLookup) : null
  const [state, dispatch] = useReducer(snapshotReducer, {
    ...idleState,
    lookupKey: null,
  })

  useEffect(() => {
    const lookup = parsePlayerLookup(lookupValue)
    if (!lookup) return

    const lookupKey = playerLookupKey(lookup)
    const lookupIdentifier = lookup.value
    const timezone = options.timezone ?? getBrowserTimezone()
    const abortController = new AbortController()
    let scheduledTimer: number | undefined
    let retryAttempt = 0
    let disposed = false

    const schedule = (delayMs: number, preserveData: boolean) => {
      if (disposed) return
      if (scheduledTimer !== undefined) window.clearTimeout(scheduledTimer)
      scheduledTimer = window.setTimeout(() => {
        scheduledTimer = undefined
        void loadSnapshot(preserveData)
      }, delayMs)
    }

    const scheduleRetry = () => {
      const delay = retryDelay(retryAttempt)
      retryAttempt += 1
      schedule(delay, true)
    }

    async function loadSnapshot(preserveData: boolean) {
      dispatch({ type: "start", lookupKey, preserveData })

      try {
        const snapshot = await widgetApiClient.getPlayerSnapshot(lookupIdentifier, {
          timezone,
          signal: abortController.signal,
          telemetry: options.telemetry,
        })
        if (disposed) return

        retryAttempt = 0
        dispatch({ type: "snapshot", lookupKey, snapshot })
        schedule(refreshDelay(snapshot), true)
      } catch (error) {
        if (disposed || abortController.signal.aborted) return

        dispatch({ type: "failure", lookupKey, message: errorMessage(error) })
        if (shouldRetry(error)) scheduleRetry()
      }
    }

    const initialTimer = window.setTimeout(() => void loadSnapshot(false), options.debounceMs ?? 0)

    return () => {
      disposed = true
      abortController.abort()
      window.clearTimeout(initialTimer)
      if (scheduledTimer !== undefined) window.clearTimeout(scheduledTimer)
    }
  }, [lookupValue, options.debounceMs, options.telemetry, options.timezone])

  if (!activeLookupKey) return idleState
  if (state.lookupKey !== activeLookupKey) return { data: null, status: "loading" }
  return state
}
