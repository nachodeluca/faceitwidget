import type { WidgetVisibilityKey } from "./types"

export const WIDGET_VISIBILITY_LABELS: Record<WidgetVisibilityKey, string> = {
  nickname: "Nickname",
  verifiedBadge: "Verification badge",
  avatar: "Avatar",
  level: "Level",
  elo: "ELO",
  eloIcon: "ELO icon",
  eloChange: "ELO change",
  regionRank: "Regional ranking",
  countryRank: "Country rank",
  challenger: "Challenger",
  challengerRank: "Rank number",
  kdr: "K/D",
  todayStats: "Wins / losses",
  recordLabels: "W/L labels",
  avgKills: "Kills",
  headshotRate: "HS %",
  winRate: "Wins %",
  rankProgress: "Rank progress",
  last30Stats: "Last 30",
  last5Results: "Last 5 results",
}

export function visibilityLabel(key: WidgetVisibilityKey) {
  return WIDGET_VISIBILITY_LABELS[key]
}
