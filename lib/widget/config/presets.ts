import type {
  WidgetPresetId,
  WidgetRotationField,
  WidgetStyle,
  WidgetData,
  WidgetPreviewSize,
  WidgetVisibilityKey,
  WidgetVisibility,
} from "../types"
import { isChallengerRank } from "../rank"

export type WidgetPreset = {
  id: WidgetPresetId
  label: string
  description: string
  previewSize: WidgetPreviewSize
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
  eloChange: false,
  recordLabels: false,
  avgKills: false,
  headshotRate: false,
  winRate: false,
  rankProgress: false,
}
const allRotationFields: WidgetRotationField[] = ["today", "last30", "lifetime"]

export const WIDGET_PRESETS: WidgetPreset[] = [
  {
    id: "elo-pill",
    label: "ELO Pill",
    description: "Level and ELO",
    previewSize: "pill",
    supportsRotation: false,
    defaultVisibility: { ...hiddenStats, challengerRank: false },
    editableFields: ["level", "challenger", "challengerRank", "elo", "last5Results"],
  },
  {
    id: "rank-elo",
    label: "Rank + ELO",
    description: "Rank, KDR, level, ELO",
    previewSize: "pill",
    supportsRotation: false,
    defaultVisibility: { ...hiddenStats, countryRank: true, kdr: true },
    editableFields: ["worldRank", "countryRank", "challengerRank", "elo", "kdr"],
  },
  {
    id: "rank-country",
    label: "Rank + Country",
    description: "World and country rank",
    previewSize: "pill",
    supportsRotation: false,
    defaultVisibility: {
      ...hiddenStats,
      countryRank: true,
    },
    editableFields: ["worldRank", "countryRank", "challengerRank", "elo"],
  },
  {
    id: "today-stats",
    label: "Today Stats",
    description: "Current session stats",
    previewSize: "card",
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
    previewSize: "card",
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
    editableFields: ["worldRank", "countryRank", "challengerRank", "elo", "kdr", "todayStats", "last30Stats"],
    defaultStyle: { density: "comfortable", radius: 12 },
  },
  {
    id: "profile-card",
    label: "Profile Card",
    description: "Rank and win/loss stats",
    previewSize: "card",
    supportsRotation: false,
    defaultVisibility: {
      ...hiddenStats,
      nickname: true,
      countryRank: true,
      challenger: true,
      challengerRank: false,
      elo: true,
      todayStats: true,
    },
    editableFields: ["nickname", "worldRank", "countryRank", "challenger", "challengerRank", "elo", "todayStats"],
    defaultStyle: { density: "comfortable", radius: 8 },
  },
  {
    id: "performance-card",
    label: "Performance Card",
    description: "Rank progress and match performance",
    previewSize: "card",
    supportsRotation: false,
    defaultVisibility: {
      ...hiddenStats,
      nickname: true,
      level: true,
      challenger: true,
      challengerRank: true,
      elo: true,
      todayStats: true,
      avgKills: true,
      kdr: true,
      headshotRate: true,
      winRate: true,
      rankProgress: true,
    },
    editableFields: [
      "nickname",
      "level",
      "challenger",
      "challengerRank",
      "elo",
      "eloChange",
      "todayStats",
      "recordLabels",
      "avgKills",
      "kdr",
      "headshotRate",
      "winRate",
      "rankProgress",
    ],
    defaultStyle: { density: "comfortable", radius: 12 },
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
const challengerWorldRankRedundantPresets = new Set<WidgetPresetId>([
  "rank-elo",
  "rank-country",
  "rich-profile",
  "profile-card",
])
const rankDependentFields = new Set<WidgetVisibilityKey>([
  ...levelOnlyFields,
  ...challengerOnlyFields,
])

function getUnavailableFields(presetId: WidgetPresetId, rank?: WidgetData["rank"]) {
  const unavailableFields = !rank
    ? new Set(rankDependentFields)
    : isChallengerRank(rank)
      ? new Set(levelOnlyFields)
      : new Set(challengerOnlyFields)

  if (challengerWorldRankRedundantPresets.has(presetId) && rank && isChallengerRank(rank)) {
    unavailableFields.add("worldRank")
  }

  return unavailableFields
}

export function getEditableFields(
  presetId: WidgetPresetId,
  rank?: WidgetData["rank"],
) {
  const unavailableFields = getUnavailableFields(presetId, rank)

  return WIDGET_PRESET_MAP[presetId].editableFields.filter(
    (field) => !unavailableFields.has(field),
  )
}
