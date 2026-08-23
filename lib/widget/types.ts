import type {
  WidgetBackdropConfig,
} from "./backgrounds/types"

export type {
  CustomWidgetBackdropId,
  WidgetBackdropConfig,
  WidgetBackdropId,
  WidgetBackdropMedia,
  WidgetBackdropPosition,
} from "./backgrounds/types"

export const WIDGET_PRESET_IDS = [
  "elo-pill",
  "rank-elo",
  "rank-country",
  "today-stats",
  "rich-profile",
  "profile-card",
] as const

export type WidgetPresetId = (typeof WIDGET_PRESET_IDS)[number]

export function isWidgetPresetId(value: unknown): value is WidgetPresetId {
  return typeof value === "string" && WIDGET_PRESET_IDS.includes(value as WidgetPresetId)
}

export type WidgetFontId = "outfit" | "system" | "mono"
export type WidgetBackground = "solid" | "none"
export type WidgetDensity = "compact" | "comfortable"
export type WidgetRotationField = "rank" | "today" | "last30" | "lifetime"

export type WidgetVisibility = {
  nickname: boolean
  avatar: boolean
  level: boolean
  elo: boolean
  worldRank: boolean
  regionRank: boolean
  countryRank: boolean
  challenger: boolean
  challengerRank: boolean
  kdr: boolean
  todayStats: boolean
  last30Stats: boolean
  last5Results: boolean
}

export type WidgetVisibilityKey = keyof WidgetVisibility

export type WidgetStyle = {
  font: WidgetFontId
  scale: number
  density: WidgetDensity
  background: WidgetBackground
  accent: string
  text: string
  mutedText: string
  surface: string
  surfaceMuted: string
  borderEnabled: boolean
  border: string
  radius: number
  opacity: number
}

export type WidgetRotation = {
  enabled: boolean
  intervalMs: number
  fields: WidgetRotationField[]
}

export type WidgetConfig = {
  version: 1
  preset: WidgetPresetId
  visibility: WidgetVisibility
  style: WidgetStyle
  rotation: WidgetRotation
  backdrop: WidgetBackdropConfig
}

export type WidgetData = {
  profile: {
    nickname: string
    avatarUrl?: string
    countryCode?: string
  }
  rank: {
    level: number
    elo: number
    eloChange?: number
    worldRank?: number
    regionRank?: number
    countryRank?: number
    isChallenger?: boolean
  }
  lifetime?: {
    avgKills?: number
    headshotRate?: number
    kdr?: number
    kr?: number
  }
  last30?: {
    winRate?: number
    avgKills?: number
    adr?: number
    avgKD?: number
    avgKR?: number
  }
  last5Results?: Array<"win" | "loss">
  today?: {
    wins?: number
    losses?: number
    avgKills?: number
    avgKD?: number
    avgKR?: number
    adr?: number
  }
}

export type PlayerLookup =
  | { kind: "nickname"; value: string }
  | { kind: "id"; value: string }

export type WidgetSnapshot = {
  data: WidgetData
  meta: {
    playerId: string
    revision: string
    generatedAt: string
    stale: boolean
    latestMatchId?: string
    refreshAfterMs: number
  }
}

export type WidgetLiveStatus = "connected" | "syncing" | "stale"

export type WidgetLiveMessage =
  | { type: "snapshot"; payload: WidgetSnapshot }
  | { type: "status"; state: WidgetLiveStatus }
  | { type: "error"; retryAfterMs: number }
