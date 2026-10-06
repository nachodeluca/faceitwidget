import type { CSSProperties } from "react"

import { getRankProgress, isChallengerRank, isUnrankedRank } from "@/lib/widget"

import {
  ChallengerRankBadge,
  CountryRank,
  EloSummary,
  LevelMark,
  PlayerNickname,
  RecordStat,
} from "../parts"
import { PerformanceMetric } from "./shared/performance-metric"
import type { PresetViewProps } from "./types"

export function getPerformanceKills(data: PresetViewProps["data"]) {
  return data.lifetime?.avgKills ?? data.last30?.avgKills ?? data.today?.avgKills
}

function RankProgressBar({ data }: Pick<PresetViewProps, "data">) {
  const unranked = isUnrankedRank(data.rank)
  if (unranked && !data.rank.placements) return null

  const progress = getRankProgress(data.rank)
  const width = `${progress.percentage}%`
  const style = { "--performance-progress-color": progress.color } as CSSProperties

  return (
    <div className="flex w-full flex-col gap-1">
      {unranked ? (
        <span className="text-[9px] font-medium leading-none text-[color:var(--widget-muted)] tabular-nums">
          {progress.label}
        </span>
      ) : null}
      <div
        className="h-[3px] w-full overflow-hidden rounded-full bg-[color:var(--widget-surface-muted)]"
        role="progressbar"
        aria-label={`${progress.label} progress`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress.percentage)}
        aria-valuetext={unranked ? progress.label : undefined}
        style={style}
      >
        <div
          className="h-full rounded-full bg-[color:var(--performance-progress-color)] transition-[width,background-color] duration-200 ease-[var(--ease-out)] motion-reduce:transition-none"
          style={{ width }}
        />
      </div>
    </div>
  )
}

export function PerformanceCardPreset({ data, config }: PresetViewProps) {
  const challenger = isChallengerRank(data.rank)
  const showChallenger = challenger && config.visibility.challenger
  const challengerRank = data.rank.regionRank
  const metrics = [
    config.visibility.avgKills
      ? { label: "Kills", value: getPerformanceKills(data), maximumFractionDigits: 0 }
      : null,
    config.visibility.kdr
      ? { label: "K/D", value: data.lifetime?.kdr, maximumFractionDigits: 2 }
      : null,
    config.visibility.headshotRate
      ? { label: "HS %", value: data.lifetime?.headshotRate, maximumFractionDigits: 1, suffix: "%" }
      : null,
    config.visibility.winRate
      ? { label: "Wins %", value: data.last30?.winRate, maximumFractionDigits: 1, suffix: "%" }
      : null,
  ].filter((metric): metric is NonNullable<typeof metric> => metric !== null)

  return (
    <div className="flex min-w-[320px] max-w-full flex-col gap-[var(--widget-layout-gap)]">
      <div
        className={
          config.visibility.todayStats
            ? "grid min-w-0 grid-cols-[repeat(4,minmax(0,1fr))] gap-2"
            : "flex min-w-0 items-center"
        }
      >
        <div
          className={
            config.visibility.todayStats
              ? "col-span-3 flex min-w-0 items-center gap-2"
              : "flex min-w-0 items-center gap-2"
          }
        >
          {showChallenger ? (
            <ChallengerRankBadge
              value={challengerRank}
              regionCode={data.profile.regionCode}
              showRankNumber={config.visibility.challengerRank}
              className={config.visibility.challengerRank ? "min-h-10" : "size-10"}
              markClassName={config.visibility.challengerRank ? "size-7" : "size-8"}
            />
          ) : (
            <LevelMark data={data} visibility={config.visibility} className="size-10" />
          )}
          <div className="flex min-w-0 flex-col gap-[5px]">
            {config.visibility.nickname ? (
              <PlayerNickname
                data={data}
                className="max-w-[13rem] truncate text-[16px] font-extrabold tracking-[-0.03em]"
                showVerifiedBadge={config.visibility.verifiedBadge}
              />
            ) : null}
            <EloSummary
              data={data}
              visibility={config.visibility}
              showChange={config.visibility.eloChange}
              className="text-[10px]"
            />
            <CountryRank
              data={data}
              visibility={config.visibility}
              className="gap-[4px] leading-none"
              flagClassName="h-3 w-[17px]"
              valueClassName="text-[10px] font-bold text-[color:var(--widget-muted)]"
            />
          </div>
        </div>

        {config.visibility.todayStats ? (
          <div
            className="col-start-4 flex shrink-0 items-start justify-start gap-[5px]"
            aria-label="Wins and losses"
            role="group"
          >
            <RecordStat
              label="wins"
              value={data.today?.wins}
              tone="positive"
              showLabel={config.visibility.recordLabels}
              className="w-[34px]"
            />
            <RecordStat
              label="losses"
              value={data.today?.losses}
              tone="negative"
              showLabel={config.visibility.recordLabels}
              className="w-[34px]"
            />
          </div>
        ) : null}
      </div>

      {metrics.length > 0 ? (
        <div
          className="grid gap-2"
          style={{ gridTemplateColumns: `repeat(${metrics.length}, minmax(0, 1fr))` }}
        >
          {metrics.map((metric) => (
            <PerformanceMetric key={metric.label} {...metric} />
          ))}
        </div>
      ) : null}

      {config.visibility.rankProgress ? <RankProgressBar data={data} /> : null}
    </div>
  )
}
