import type { WidgetData } from "./types"

export const CHALLENGER_RANK_LIMIT = 1000

export const CHALLENGER_RANK_COLORS = {
  gold: "#FFD335",
  silver: "#DEF5FF",
  bronze: "#FF7236",
  top: "#E80129",
} as const

export const FACEIT_LEVEL_COLORS = {
  1: "#CDCDCD",
  2: "#1CE400",
  3: "#1CE400",
  4: "#FFC800",
  5: "#FFC800",
  6: "#FFC800",
  7: "#FFC800",
  8: "#FF6309",
  9: "#FF6309",
  10: "#FE1F00",
} as const

const FACEIT_LEVEL_RANGES = {
  1: { min: 100, max: 500 },
  2: { min: 501, max: 750 },
  3: { min: 751, max: 900 },
  4: { min: 901, max: 1_050 },
  5: { min: 1_051, max: 1_200 },
  6: { min: 1_201, max: 1_350 },
  7: { min: 1_351, max: 1_530 },
  8: { min: 1_531, max: 1_750 },
  9: { min: 1_751, max: 2_000 },
  10: { min: 2_001, max: 2_001 },
} as const

type ChallengerRankTier = keyof typeof CHALLENGER_RANK_COLORS

function challengerRankTier(value?: number): ChallengerRankTier {
  if (value === 1) return "gold"
  if (value === 2) return "silver"
  if (value === 3) return "bronze"
  return "top"
}

export function getChallengerRankColor(value?: number) {
  return CHALLENGER_RANK_COLORS[challengerRankTier(value)]
}

export type RankProgress = {
  percentage: number
  color: string
  label: string
}

export function hasEloChange(value: number | undefined): value is number {
  return value !== undefined && Number.isFinite(value) && value !== 0
}

export function isChallengerRank(rank: WidgetData["rank"]) {
  const rankPosition = rank.worldRank ?? rank.regionRank

  return rank.level === 10
    && rankPosition !== undefined
    && rankPosition >= 1
    && rankPosition <= CHALLENGER_RANK_LIMIT
}

export function getRankProgress(rank: WidgetData["rank"]): RankProgress {
  const level = Math.min(10, Math.max(1, Math.round(rank.level || 1))) as keyof typeof FACEIT_LEVEL_RANGES

  if (isChallengerRank(rank)) {
    return {
      percentage: 100,
      color: getChallengerRankColor(rank.worldRank ?? rank.regionRank),
      label: "Challenger",
    }
  }

  if (level === 10) {
    return {
      percentage: 100,
      color: FACEIT_LEVEL_COLORS[10],
      label: "Level 10",
    }
  }

  const range = FACEIT_LEVEL_RANGES[level]
  const elo = Number.isFinite(rank.elo) ? rank.elo : range.min
  const percentage = ((elo - range.min) / (range.max - range.min)) * 100

  return {
    percentage: Math.min(100, Math.max(0, percentage)),
    color: FACEIT_LEVEL_COLORS[level],
    label: `Level ${level}`,
  }
}
