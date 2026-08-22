export type StatTone = "default" | "positive" | "negative"

export function getWinRateTone(winRate?: number): StatTone {
  if (winRate === undefined) return "default"
  if (winRate <= 20) return "negative"
  if (winRate <= 50) return "default"
  return "positive"
}
