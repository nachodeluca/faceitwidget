import type { WidgetData } from "./types"

export const CHALLENGER_RANK_LIMIT = 1000

export function isChallengerRank(rank: WidgetData["rank"]) {
  const regionalRank = rank.regionRank ?? rank.worldRank

  return rank.level === 10
    && regionalRank !== undefined
    && regionalRank >= 1
    && regionalRank <= CHALLENGER_RANK_LIMIT
}
