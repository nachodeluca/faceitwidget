"use client"

import { useEffect, useReducer } from "react"

import { widgetApiClient, WidgetApiError } from "./api-client"
import { getBrowserTimezone, parsePlayerLookup, playerLookupKey } from "./player-lookup"
import type { WidgetData, WidgetLiveMessage, WidgetLiveStatus, WidgetSnapshot } from "../types"

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
  status: WidgetLiveStatus
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
  | { type: "status"; lookupKey: string; status: WidgetLiveStatus }
  | { type: "failure"; lookupKey: string; message: string }

const idleState: PlayerSnapshotPendingState = { data: null, status: "idle" }

function snapshotReducer(
  state: StoredPlayerSnapshotState,
  action: SnapshotAction,
): StoredPlayerSnapshotState {
  if (action.type === "start") {
    const sameLookup = action.preserveData && state.lookupKey === action.lookupKey
    const retainedData = sameLookup
      ? state.data
      : null
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

  if (action.type === "status") {
    return state.data && state.playerId
      ? { data: state.data, playerId: state.playerId, status: action.status, lookupKey: action.lookupKey }
      : state
  }

  return state.data && state.playerId
    ? { data: state.data, playerId: state.playerId, status: "stale", lookupKey: action.lookupKey }
    : { data: null, status: "error", error: action.message, lookupKey: action.lookupKey }
}

function errorMessage(error: unknown) {
  return error instanceof WidgetApiError
    ? error.message
    : "Unable to connect to the stats service."
}

function shouldRetry(error: unknown) {
  return !(error instanceof WidgetApiError) || error.status === 429 || error.status >= 500
}

function reconnectDelay(attempt: number) {
  return Math.min(30_000, 1_000 * 2 ** attempt)
}

export function usePlayerSnapshot(
  lookupValue: string,
  options: { debounceMs?: number; live?: boolean; timezone?: string } = {},
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
    let unsubscribe: (() => void) | undefined
    let reconnectTimer: number | undefined
    let reconnectAttempt = 0
    let disposed = false

    const applyLiveMessage = (message: WidgetLiveMessage) => {
      switch (message.type) {
        case "snapshot":
          reconnectAttempt = 0
          dispatch({ type: "snapshot", lookupKey, snapshot: message.payload })
          break
        case "status":
          dispatch({ type: "status", lookupKey, status: message.state })
          break
        case "error":
          dispatch({ type: "failure", lookupKey, message: "Unable to load FACEIT stats." })
          break
      }
    }

    const scheduleReconnect = () => {
      if (disposed || options.live === false) return

      const delay = reconnectDelay(reconnectAttempt)
      reconnectAttempt += 1
      reconnectTimer = window.setTimeout(() => void loadSnapshot(true), delay)
    }

    const connect = () => {
      if (disposed || options.live === false) return

      unsubscribe?.()
      unsubscribe = widgetApiClient.subscribe(lookupIdentifier, {
        timezone,
        onMessage: applyLiveMessage,
        onDisconnect() {
          dispatch({ type: "status", lookupKey, status: "stale" })
          scheduleReconnect()
        },
      })
    }

    async function loadSnapshot(preserveData: boolean) {
      dispatch({ type: "start", lookupKey, preserveData })

      try {
        const snapshot = await widgetApiClient.getPlayerSnapshot(lookupIdentifier, {
          timezone,
          signal: abortController.signal,
        })
        if (disposed) return

        reconnectAttempt = 0
        dispatch({ type: "snapshot", lookupKey, snapshot })
        connect()
      } catch (error) {
        if (disposed || abortController.signal.aborted) return

        dispatch({ type: "failure", lookupKey, message: errorMessage(error) })
        if (shouldRetry(error)) scheduleReconnect()
      }
    }

    const timer = window.setTimeout(() => void loadSnapshot(false), options.debounceMs ?? 0)

    return () => {
      disposed = true
      abortController.abort()
      window.clearTimeout(timer)
      if (reconnectTimer) window.clearTimeout(reconnectTimer)
      unsubscribe?.()
    }
  }, [lookupValue, options.debounceMs, options.live, options.timezone])

  if (!activeLookupKey) return idleState
  if (state.lookupKey !== activeLookupKey) return { data: null, status: "loading" }
  return state
}
