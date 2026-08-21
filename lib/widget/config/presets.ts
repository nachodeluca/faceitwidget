import type {
  WidgetPresetId,
  WidgetRotationField,
  WidgetStyle,
  WidgetData,
  WidgetVisibilityKey,
  WidgetVisibility,
} from "../types"
import { isChallengerRank } from "../rank"

export type WidgetPreset = {
  id: WidgetPresetId
  label: string
  description: string
  supportsRotation: boolean
  defaultRotationFields?: WidgetRotationField[]
  rotationFields?: WidgetRotationField[]
  defaultVisibility: WidgetVisibility
  editableFields: WidgetVisibilityKey[]
  defaultStyle?: Partial<WidgetStyle>
}

const hiddenStats: WidgetVisibility = {
  nickname: false,
  avatar: false,
  level: true,
  elo: true,
  worldRank: false,
  regionRank: false,
  countryRank: false,
  challenger: true,
  challengerRank: true,
  kdr: false,
  todayStats: false,
  last30Stats: false,
  last5Results: false,
}
const allRotationFields: WidgetRotationField[] = ["today", "last30", "lifetime"]

export const WIDGET_PRESETS: WidgetPreset[] = [
  {
    id: "elo-pill",
    label: "ELO Pill",
    description: "Level and ELO",
    supportsRotation: false,
    defaultVisibility: { ...hiddenStats, challengerRank: false },
    editableFields: ["level", "challenger", "challengerRank", "elo", "last5Results"],
  },
  {
    id: "rank-elo",
    label: "Rank + ELO",
    description: "Rank, KDR, level, ELO",
    supportsRotation: false,
    defaultVisibility: { ...hiddenStats, countryRank: true, kdr: true },
    editableFields: ["worldRank", "regionRank", "countryRank", "challengerRank", "elo", "kdr"],
  },
  {
    id: "rank-country",
    label: "Rank + Country",
    description: "World and country rank",
    supportsRotation: false,
    defaultVisibility: {
      ...hiddenStats,
      countryRank: true,
    },
    editableFields: ["worldRank", "regionRank", "countryRank", "challengerRank", "elo"],
  },
  {
    id: "today-stats",
    label: "Today Stats",
    description: "Current session stats",
    supportsRotation: true,
    defaultRotationFields: ["today", "last30"],
    rotationFields: ["today", "last30"],
    defaultVisibility: {
      ...hiddenStats,
      nickname: true,
      challengerRank: false,
      todayStats: true,
      last30Stats: true,
    },
    editableFields: [
      "nickname",
      "level",
      "challenger",
      "challengerRank",
      "elo",
      "todayStats",
      "last30Stats",
    ],
    defaultStyle: { density: "comfortable", radius: 10 },
  },
  {
    id: "rich-profile",
    label: "Rich Profile",
    description: "Profile, rank, stats",
    supportsRotation: true,
    defaultRotationFields: ["today", "last30"],
    defaultVisibility: {
      ...hiddenStats,
      worldRank: true,
      countryRank: true,
      challenger: true,
      kdr: true,
      todayStats: true,
      last30Stats: true,
    },
    editableFields: ["worldRank", "regionRank", "countryRank", "challengerRank", "elo", "kdr", "todayStats", "last30Stats"],
    defaultStyle: { density: "comfortable", radius: 12 },
  },
  {
    id: "rich-history",
    label: "Last 30",
    description: "Recent form stats",
    supportsRotation: true,
    defaultRotationFields: ["last30", "today"],
    defaultVisibility: {
      ...hiddenStats,
      worldRank: true,
      countryRank: true,
      kdr: true,
      todayStats: true,
      last30Stats: true,
    },
    editableFields: ["worldRank", "regionRank", "countryRank", "challengerRank", "elo", "kdr", "todayStats", "last30Stats"],
    defaultStyle: { density: "comfortable", radius: 12 },
  },
  {
    id: "stream-card",
    label: "Stream Card",
    description: "Profile with rotating stats",
    supportsRotation: true,
    defaultRotationFields: ["today", "last30"],
    defaultVisibility: {
      ...hiddenStats,
      nickname: true,
      avatar: true,
      worldRank: true,
      countryRank: true,
      todayStats: true,
      last30Stats: true,
    },
    editableFields: ["nickname", "level", "challenger", "elo", "kdr", "todayStats", "last30Stats"],
    defaultStyle: { density: "comfortable", radius: 14 },
  },
  {
    id: "profile-card",
    label: "Profile Card",
    description: "Rank and win/loss stats",
    supportsRotation: false,
    defaultVisibility: {
      ...hiddenStats,
      nickname: true,
      worldRank: true,
      countryRank: true,
      challenger: true,
      elo: true,
      todayStats: true,
    },
    editableFields: ["nickname", "worldRank", "countryRank", "challenger", "challengerRank", "elo", "todayStats"],
    defaultStyle: { density: "comfortable", radius: 8 },
  },
]

export const WIDGET_PRESET_MAP = Object.fromEntries(
  WIDGET_PRESETS.map((preset) => [preset.id, preset]),
) as Record<WidgetPresetId, WidgetPreset>

export function getRotationFields(presetId: WidgetPresetId) {
  return WIDGET_PRESET_MAP[presetId].rotationFields ?? allRotationFields
}

export function supportsWidgetRotation(preset: WidgetPresetId) {
  return WIDGET_PRESET_MAP[preset]?.supportsRotation === true
}

const levelOnlyFields = new Set<WidgetVisibilityKey>(["level"])
const challengerOnlyFields = new Set<WidgetVisibilityKey>(["challenger", "challengerRank"])
const rankDependentFields = new Set<WidgetVisibilityKey>([
  ...levelOnlyFields,
  ...challengerOnlyFields,
])

export function getEditableFields(
  presetId: WidgetPresetId,
  rank?: WidgetData["rank"],
) {
  const unavailableFields = !rank
    ? rankDependentFields
    : isChallengerRank(rank)
      ? levelOnlyFields
      : challengerOnlyFields

  return WIDGET_PRESET_MAP[presetId].editableFields.filter(
    (field) => !unavailableFields.has(field),
  )
}
