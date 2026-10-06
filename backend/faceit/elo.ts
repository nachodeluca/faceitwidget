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
  // A hidden placement ELO ends the preceding ranked tracking period.
  if (!Number.isFinite(observation.elo) || observation.elo <= 0) return []

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
  if (!Number.isFinite(currentElo) || currentElo <= 0) return undefined

  const today = calendarDay(now, timezone)
  const sorted = [...(history ?? []), { observedAt: now, elo: currentElo }].sort(
    (left, right) => left.observedAt - right.observedAt,
  )
  // Discard earlier seasons in histories saved before Unranked was supported.
  const lastHiddenIndex = sorted.findLastIndex(({ elo }) => !Number.isFinite(elo) || elo <= 0)
  const observations = sorted.slice(lastHiddenIndex + 1)
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
