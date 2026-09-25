import type { CSSProperties } from "react"

import { getRankProgress, isChallengerRank } from "@/lib/widget"

import { AnimatedNumber } from "../animated-number"
import {
  EloSummary,
  ChallengerRankBadge,
  LevelMark,
  PlayerNickname,
  RecordStat,
} from "../parts"
import type { PresetViewProps } from "./types"

export function getPerformanceKills(data: PresetViewProps["data"]) {
  return data.lifetime?.avgKills ?? data.last30?.avgKills ?? data.today?.avgKills
}

function hasValue(value?: number) {
  return typeof value === "number" && Number.isFinite(value)
}

function PerformanceMetric({
  label,
  value,
  maximumFractionDigits = 0,
  suffix,
}: {
  label: string
  value?: number
  maximumFractionDigits?: number
  suffix?: string
}) {
  return (
    <div className="flex min-w-0 flex-col gap-[4px]">
      <strong className="whitespace-nowrap text-[15px] font-extrabold leading-none tracking-[-0.02em] text-[color:var(--widget-text)] tabular-nums">
        <AnimatedNumber value={value} maximumFractionDigits={maximumFractionDigits} />
        {suffix && hasValue(value) ? suffix : null}
      </strong>
      <span className="whitespace-nowrap text-[8px] font-bold uppercase leading-none tracking-[0.04em] text-[color:var(--widget-muted)]">
        {label}
      </span>
    </div>
  )
}

function RankProgressBar({ data }: Pick<PresetViewProps, "data">) {
  const progress = getRankProgress(data.rank)
  const width = `${progress.percentage}%`
  const style = { "--performance-progress-color": progress.color } as CSSProperties

  return (
    <div
      className="h-[3px] w-full overflow-hidden rounded-full bg-[color:var(--widget-surface-muted)]"
      role="progressbar"
      aria-label={`${progress.label} progress`}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress.percentage)}
      style={style}
    >
      <div
        className="h-full rounded-full bg-[color:var(--performance-progress-color)] transition-[width,background-color] duration-200 ease-[var(--ease-out)]"
        style={{ width }}
      />
    </div>
  )
}

export function PerformanceCardPreset({ data, config }: PresetViewProps) {
  const challenger = isChallengerRank(data.rank)
  const showChallenger = challenger && config.visibility.challenger
  const challengerRank = data.rank.worldRank ?? data.rank.regionRank
  const metrics = [
    config.visibility.avgKills
      ? { label: "Kills", value: getPerformanceKills(data), maximumFractionDigits: 1 }
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
      <div className={config.visibility.todayStats
        ? "grid min-w-0 grid-cols-[repeat(4,minmax(0,1fr))] gap-2"
        : "flex min-w-0 items-center"}
      >
        <div className={config.visibility.todayStats
          ? "col-span-3 flex min-w-0 items-center gap-2"
          : "flex min-w-0 items-center gap-2"}
        >
          {showChallenger ? (
            <ChallengerRankBadge
              value={challengerRank}
              showRankNumber={config.visibility.challengerRank}
              className={config.visibility.challengerRank ? "min-h-10" : "size-10"}
              markClassName={config.visibility.challengerRank ? "size-6" : undefined}
            />
          ) : (
            <LevelMark data={data} visibility={config.visibility} className="size-10" />
          )}
          <div className="flex min-w-0 flex-col gap-[5px]">
            {config.visibility.nickname ? (
              <PlayerNickname
                data={data}
                className="max-w-[13rem] truncate text-[16px] font-extrabold tracking-[-0.03em]"
              />
            ) : null}
            <EloSummary
              data={data}
              visibility={config.visibility}
              showChange={config.visibility.eloChange}
              className="text-[10px]"
            />
          </div>
        </div>

        {config.visibility.todayStats ? (
          <div className="col-start-4 flex shrink-0 items-start justify-start gap-[5px]" aria-label="Wins and losses">
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
