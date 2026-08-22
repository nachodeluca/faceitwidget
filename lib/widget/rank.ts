import type { WidgetData } from "./types"

export const CHALLENGER_RANK_LIMIT = 1000

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
