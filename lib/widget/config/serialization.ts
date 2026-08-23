import { isRecord } from "../../utils"
import { createDefaultConfig, normalizeConfig } from "./config"
import {
  isWidgetPresetId,
  type WidgetConfig,
  type WidgetPresetId,
} from "../types"

const COMPACT_PREFIX = "v2."

const VISIBILITY_KEYS = [
  "nickname",
  "avatar",
  "level",
  "elo",
  "worldRank",
  "regionRank",
  "countryRank",
  "challenger",
  "challengerRank",
  "kdr",
  "todayStats",
  "last30Stats",
  "last5Results",
] as const satisfies readonly (keyof WidgetConfig["visibility"])[]

const STYLE_FIELDS = [
  ["font", "f"],
  ["scale", "q"],
  ["density", "d"],
  ["background", "g"],
  ["accent", "a"],
  ["text", "t"],
  ["mutedText", "m"],
  ["surface", "u"],
  ["surfaceMuted", "um"],
  ["borderEnabled", "e"],
  ["border", "b"],
  ["radius", "r"],
  ["opacity", "o"],
] as const satisfies readonly (readonly [keyof WidgetConfig["style"], string])[]

type CompactRotation = {
  e?: boolean
  i?: number
  f?: string
}

type CompactConfig = {
  v: 2
  p: WidgetPresetId
  x?: string
  s?: Record<string, unknown>
  r?: CompactRotation
}

function encodeBase64Url(value: string) {
  const bytes = new TextEncoder().encode(value)
  let binary = ""

  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }

  return globalThis
    .btoa(binary)
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/, "")
}

function decodeBase64Url(value: string) {
  const normalized = value.replaceAll("-", "+").replaceAll("_", "/")
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=")
  const binary = globalThis.atob(padded)
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

function visibilityMask(visibility: WidgetConfig["visibility"]) {
  return VISIBILITY_KEYS.reduce(
    (mask, key, index) => mask | (visibility[key] ? 1 << index : 0),
    0,
  )
}

function compactVisibility(
  current: WidgetConfig["visibility"],
  defaults: WidgetConfig["visibility"],
) {
  const currentMask = visibilityMask(current)
  return currentMask === visibilityMask(defaults) ? undefined : currentMask.toString(36)
}

function compactStyle(
  current: WidgetConfig["style"],
  defaults: WidgetConfig["style"],
) {
  const style: Record<string, unknown> = {}
  for (const [field, key] of STYLE_FIELDS) {
    if (current[field] !== defaults[field]) {
      style[key] = current[field]
    }
  }
  return Object.keys(style).length > 0 ? style : undefined
}

function compactRotation(
  current: WidgetConfig["rotation"],
  defaults: WidgetConfig["rotation"],
): CompactRotation | undefined {
  const rotation: CompactRotation = {}
  if (current.enabled !== defaults.enabled) {
    rotation.e = current.enabled
  }
  if (current.intervalMs !== defaults.intervalMs) {
    rotation.i = current.intervalMs
  }
  const fields = current.fields.join(",")
  if (fields !== defaults.fields.join(",")) {
    rotation.f = fields
  }
  return Object.keys(rotation).length > 0 ? rotation : undefined
}

function compactConfig(config: WidgetConfig): CompactConfig {
  const normalized = normalizeConfig(config)
  const defaults = createDefaultConfig(normalized.preset)
  const compact: CompactConfig = { v: 2, p: normalized.preset }
  const visibility = compactVisibility(normalized.visibility, defaults.visibility)
  const style = compactStyle(normalized.style, defaults.style)
  const rotation = compactRotation(normalized.rotation, defaults.rotation)

  if (visibility !== undefined) compact.x = visibility
  if (style) compact.s = style
  if (rotation) compact.r = rotation

  return compact
}

function expandVisibilityMask(value: unknown, defaults: WidgetConfig["visibility"]) {
  const visibility = { ...defaults }
  const mask = typeof value === "string" ? Number.parseInt(value, 36) : Number.NaN

  if (Number.isFinite(mask)) {
    for (const [index, key] of VISIBILITY_KEYS.entries()) {
      visibility[key] = (mask & (1 << index)) !== 0
    }
  }
  return visibility
}

function expandStylePatch(value: unknown) {
  const style: Record<string, unknown> = {}
  if (!isRecord(value)) return style

  for (const [field, key] of STYLE_FIELDS) {
    if (key in value) style[field] = value[key]
  }
  return style
}

function expandRotationPatch(value: unknown) {
  const rotation: Record<string, unknown> = {}
  if (!isRecord(value)) return rotation

  if (typeof value.e === "boolean") rotation.enabled = value.e
  if (typeof value.i === "number") rotation.intervalMs = value.i
  if (typeof value.f === "string") rotation.fields = value.f.split(",")
  return rotation
}

function expandCompactConfig(value: unknown) {
  if (!isRecord(value) || value.v !== 2 || !isWidgetPresetId(value.p)) {
    return normalizeConfig(undefined)
  }

  const defaults = createDefaultConfig(value.p)
  return normalizeConfig({
    ...defaults,
    visibility: expandVisibilityMask(value.x, defaults.visibility),
    style: { ...defaults.style, ...expandStylePatch(value.s) },
    rotation: { ...defaults.rotation, ...expandRotationPatch(value.r) },
  })
}

function deserializeCompactValue(value: string) {
  const payload = value.slice(COMPACT_PREFIX.length)

  if (isWidgetPresetId(payload)) {
    return createDefaultConfig(payload)
  }

  return expandCompactConfig(JSON.parse(decodeBase64Url(payload)))
}

export function serializeConfig(config: WidgetConfig) {
  const compact = compactConfig(config)

  if (!compact.x && !compact.s && !compact.r) {
    return `${COMPACT_PREFIX}${compact.p}`
  }

  return `${COMPACT_PREFIX}${encodeBase64Url(JSON.stringify(compact))}`
}

export function deserializeConfig(value?: string | string[]) {
  if (!value || Array.isArray(value)) {
    return normalizeConfig(undefined)
  }

  try {
    if (value.startsWith(COMPACT_PREFIX)) {
      return deserializeCompactValue(value)
    }

    return normalizeConfig(JSON.parse(decodeBase64Url(value)))
  } catch {
    return normalizeConfig(undefined)
  }
}

export function buildWidgetUrl(
  origin: string,
  playerId: string,
  config: WidgetConfig,
  timezone?: string,
) {
  const params = new URLSearchParams()
  params.set("playerId", playerId.trim())
  params.set("config", serializeConfig(config))
  if (timezone) params.set("tz", timezone)
  return `${origin}/widget/?${params.toString()}`
}
