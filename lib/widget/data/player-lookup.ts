import type { PlayerLookup } from "../types"

const PLAYER_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const NICKNAME_PATTERN = /^[a-z0-9_-]{1,32}$/i

export function parsePlayerLookup(value: string): PlayerLookup | null {
  const normalized = value.trim()

  if (PLAYER_ID_PATTERN.test(normalized)) {
    return { kind: "id", value: normalized.toLowerCase() }
  }

  if (NICKNAME_PATTERN.test(normalized)) {
    return { kind: "nickname", value: normalized }
  }

  return null
}

export function playerLookupKey(lookup: PlayerLookup) {
  return `${lookup.kind}:${lookup.value.toLowerCase()}`
}

export function isValidTimezone(value: string) {
  if (!value || value.length > 64) return false

  try {
    new Intl.DateTimeFormat("en-US", { timeZone: value }).format()
    return true
  } catch {
    return false
  }
}

export function getBrowserTimezone(fallback = "UTC") {
  if (typeof window === "undefined") return fallback
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
  return isValidTimezone(timezone) ? timezone : fallback
}
