import type { PlayerLookup, WidgetData, WidgetSnapshot } from "../../lib/widget/types"
import { isChallengerRank } from "../../lib/widget/rank"
import { ApiError } from "../errors"
import { FaceitGateway } from "./gateway"
import { calendarDay, dailyEloChange, type EloObservation } from "./elo"
import type { FaceitPlayer, FaceitRanking } from "./schemas"

type StatRecord = Record<string, unknown>

export type NormalizedMatch = {
  matchId?: string
  finishedAt?: number
  won?: boolean
  kills?: number
  deaths?: number
  kd?: number
  kr?: number
  adr?: number
}

export type PlayerFacts = {
  playerId: string
  baseData: Omit<WidgetData, "today" | "last30">
  matches: NormalizedMatch[]
  latestMatchId?: string
  generatedAt: number
  revision: string
}

const STAT_ALIASES = {
  matchId: ["Match Id", "Match ID", "match_id"],
  finishedAt: ["Match Finished At", "Finished At", "finished_at"],
  result: ["Result", "Win", "Winner"],
  kills: ["Kills"],
  deaths: ["Deaths"],
  kd: ["K/D Ratio", "K/D", "KD Ratio"],
  kr: ["K/R Ratio", "K/R", "KR Ratio"],
  adr: ["ADR", "Average Damage per Round"],
  lifetimeAvgKills: ["Average Kills", "Avg Kills"],
  lifetimeHeadshots: ["Average Headshots %", "Headshots %"],
  lifetimeKd: ["Average K/D Ratio", "K/D Ratio", "K/D"],
  lifetimeKr: ["Average K/R Ratio", "K/R Ratio", "K/R"],
} as const

function normalizedKey(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "")
}

function statValue(record: StatRecord, aliases: readonly string[]) {
  const valuesByKey = new Map(
    Object.entries(record).map(([key, value]) => [normalizedKey(key), value]),
  )

  for (const alias of aliases) {
    const key = normalizedKey(alias)
    if (valuesByKey.has(key)) return valuesByKey.get(key)
  }

  return undefined
}

function numberValue(value: unknown) {
  if (typeof value === "number") return Number.isFinite(value) ? value : undefined
  if (typeof value !== "string") return undefined
  const number = Number(value.trim().replace("%", "").replace(",", "."))
  return Number.isFinite(number) ? number : undefined
}

function boundedNumberValue(value: unknown, minimum: number, maximum: number) {
  const number = numberValue(value)
  return number !== undefined && number >= minimum && number <= maximum
    ? number
    : undefined
}

function stringValue(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined
}

function timestampValue(value: unknown) {
  const timestamp = numberValue(value)
  if (timestamp === undefined) return undefined
  return timestamp < 10_000_000_000 ? timestamp * 1000 : timestamp
}

function resultValue(value: unknown) {
  if (typeof value === "boolean") return value
  if (typeof value === "number") return value > 0
  if (typeof value !== "string") return undefined
  const normalized = value.trim().toLowerCase()
  if (["1", "true", "win", "won"].includes(normalized)) return true
  if (["0", "false", "loss", "lost"].includes(normalized)) return false
  return undefined
}

export function normalizeMatch(record: StatRecord): NormalizedMatch {
  return {
    matchId: stringValue(statValue(record, STAT_ALIASES.matchId)),
    finishedAt: timestampValue(statValue(record, STAT_ALIASES.finishedAt)),
    won: resultValue(statValue(record, STAT_ALIASES.result)),
    kills: numberValue(statValue(record, STAT_ALIASES.kills)),
    deaths: numberValue(statValue(record, STAT_ALIASES.deaths)),
    kd: numberValue(statValue(record, STAT_ALIASES.kd)),
    kr: numberValue(statValue(record, STAT_ALIASES.kr)),
    adr: numberValue(statValue(record, STAT_ALIASES.adr)),
  }
}

export function normalizeLifetime(record: StatRecord) {
  return {
    avgKills: boundedNumberValue(statValue(record, STAT_ALIASES.lifetimeAvgKills), 0, 100),
    headshotRate: boundedNumberValue(statValue(record, STAT_ALIASES.lifetimeHeadshots), 0, 100),
    kdr: boundedNumberValue(statValue(record, STAT_ALIASES.lifetimeKd), 0, 100),
    kr: boundedNumberValue(statValue(record, STAT_ALIASES.lifetimeKr), 0, 100),
  }
}

function average(values: Array<number | undefined>) {
  const present = values.filter((value): value is number => value !== undefined)
  if (present.length === 0) return undefined
  return present.reduce((total, value) => total + value, 0) / present.length
}

function calculatedKd(match: NormalizedMatch) {
  if (match.kd !== undefined) return match.kd
  if (match.kills === undefined || match.deaths === undefined) return undefined
  return match.deaths === 0 ? match.kills : match.kills / match.deaths
}

function aggregateMatches(matches: NormalizedMatch[]) {
  const completed = matches.filter((match) => match.finishedAt !== undefined)
  const decided = completed.filter((match) => match.won !== undefined)
  const wins = decided.filter((match) => match.won).length

  return {
    wins,
    losses: decided.length - wins,
    winRate: decided.length > 0 ? Math.round((wins / decided.length) * 100) : undefined,
    avgKills: average(completed.map((match) => match.kills)),
    avgKD: average(completed.map(calculatedKd)),
    avgKR: average(completed.map((match) => match.kr)),
    adr: average(completed.map((match) => match.adr)),
  }
}

export function createWidgetSnapshot(
  facts: PlayerFacts,
  timezone: string,
  options: {
    stale: boolean
    refreshAfterMs: number
    eloHistory?: readonly EloObservation[]
    now?: number
  },
): WidgetSnapshot {
  const now = options.now ?? Date.now()
  const sortedMatches = [...facts.matches].sort(
    (left, right) => (right.finishedAt ?? 0) - (left.finishedAt ?? 0),
  )
  const last30 = aggregateMatches(sortedMatches.slice(0, 30))
  const last5Results = sortedMatches
    .filter((match): match is NormalizedMatch & { won: boolean } => match.won !== undefined)
    .slice(0, 5)
    .map((match) => (match.won ? ("win" as const) : ("loss" as const)))
  const todayKey = calendarDay(now, timezone)
  const today = aggregateMatches(
    sortedMatches.filter(
      (match) => match.finishedAt !== undefined && calendarDay(match.finishedAt, timezone) === todayKey,
    ),
  )
  const eloChange = dailyEloChange(options.eloHistory, facts.baseData.rank.elo, now, timezone)

  return {
    data: {
      ...facts.baseData,
      rank: {
        ...facts.baseData.rank,
        ...(eloChange === undefined ? {} : { eloChange }),
      },
      last30: {
        winRate: last30.winRate,
        avgKills: last30.avgKills,
        avgKD: last30.avgKD,
        avgKR: last30.avgKR,
        adr: last30.adr,
      },
      last5Results,
      today: {
        wins: today.wins,
        losses: today.losses,
        avgKills: today.avgKills,
        avgKD: today.avgKD,
        avgKR: today.avgKR,
        adr: today.adr,
      },
    },
    meta: {
      playerId: facts.playerId,
      revision: facts.revision,
      generatedAt: new Date(facts.generatedAt).toISOString(),
      stale: options.stale,
      latestMatchId: facts.latestMatchId,
      refreshAfterMs: options.refreshAfterMs,
    },
  }
}

async function optionalRanking(request: Promise<FaceitRanking>) {
  try {
    return await request
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return undefined
    throw error
  }
}

async function resolvePlayer(gateway: FaceitGateway, lookup: PlayerLookup) {
  return lookup.kind === "id"
    ? gateway.getPlayerById(lookup.value)
    : gateway.getPlayerByNickname(lookup.value)
}

function safeImageUrl(value: string | undefined) {
  if (!value) return undefined
  try {
    const url = new URL(value)
    return url.protocol === "https:" ? url.toString() : undefined
  } catch {
    return undefined
  }
}

export async function fetchPlayerFacts(gateway: FaceitGateway, lookup: PlayerLookup): Promise<PlayerFacts> {
  const player: FaceitPlayer = await resolvePlayer(gateway, lookup)
  const game = player.games.cs2

  if (!game) {
    throw new ApiError(404, "This FACEIT player does not have a CS2 profile.")
  }

  const playerId = player.player_id
  const region = game.region?.toUpperCase()
  const country = player.country?.toLowerCase()
  const [lifetime, matchStats, history, ranking, countryRanking] = await Promise.all([
    gateway.getLifetime(playerId),
    gateway.getMatchStats(playerId),
    gateway.getHistory(playerId),
    region ? optionalRanking(gateway.getRanking(playerId, region)) : undefined,
    region && country ? optionalRanking(gateway.getRanking(playerId, region, country)) : undefined,
  ])
  const matches = matchStats.items.map((item) => normalizeMatch(item.stats))
  const worldRank = ranking?.position
  const latestMatchId = history.items[0]?.match_id ?? matches[0]?.matchId
  const normalizedLifetime = normalizeLifetime(lifetime.lifetime)
  const rank = {
    level: game.skill_level ?? 0,
    elo: game.faceit_elo ?? 0,
    worldRank,
    countryRank: countryRanking?.position,
  }

  return {
    playerId,
    baseData: {
      profile: {
        nickname: player.nickname,
        avatarUrl: safeImageUrl(player.avatar),
        countryCode: country,
      },
      rank: { ...rank, isChallenger: isChallengerRank(rank) },
      lifetime: normalizedLifetime,
    },
    matches,
    latestMatchId,
    generatedAt: Date.now(),
    revision: crypto.randomUUID(),
  }
}

export async function fetchLatestMatchId(gateway: FaceitGateway, playerId: string) {
  const history = await gateway.getHistory(playerId)
  return history.items[0]?.match_id
}
