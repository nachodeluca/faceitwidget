export type EloObservation = {
  observedAt: number
  elo: number
}

const HISTORY_WINDOW_MS = 3 * 24 * 60 * 60 * 1_000
const MAX_OBSERVATIONS = 200

export function calendarDay(timestamp: number, timezone: string) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(timestamp)
}

export function rememberElo(
  history: readonly EloObservation[] | undefined,
  observation: EloObservation,
) {
  const cutoff = observation.observedAt - HISTORY_WINDOW_MS

  return [...(history ?? []), observation]
    .filter(({ observedAt }) => observedAt >= cutoff)
    .slice(-MAX_OBSERVATIONS)
}

export function dailyEloChange(
  history: readonly EloObservation[] | undefined,
  currentElo: number,
  now: number,
  timezone: string,
) {
  const today = calendarDay(now, timezone)
  const observations = [...(history ?? []), { observedAt: now, elo: currentElo }]
    .sort((left, right) => left.observedAt - right.observedAt)
  const todayObservations = observations.filter(
    (observation) => calendarDay(observation.observedAt, timezone) === today,
  )

  if (todayObservations.length === 0) return undefined

  const previousDay = observations.filter(
    (observation) => calendarDay(observation.observedAt, timezone) < today,
  )
  const baseline = previousDay.at(-1) ?? todayObservations[0]

  return currentElo - baseline.elo
}
