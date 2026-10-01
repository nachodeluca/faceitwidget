import { AnimatedNumber } from "../animated-number"
import { CountryRank, EloIcon, LastFiveResults, LevelMark, PlayerNickname, RegionRank } from "../parts"
import { PerformanceMetric, type PerformanceMetricProps } from "./shared/performance-metric"
import type { PresetViewProps } from "./types"

function CompactLast30Metrics({ data }: Pick<PresetViewProps, "data">) {
  const metrics: PerformanceMetricProps[] = [
    { label: "AVG", value: data.last30?.avgKills, maximumFractionDigits: 0 },
    { label: "ADR", value: data.last30?.adr, maximumFractionDigits: 0 },
    { label: "KD", value: data.last30?.avgKD, maximumFractionDigits: 2 },
    { label: "KR", value: data.last30?.avgKR, maximumFractionDigits: 1 },
  ]

  return (
    <div className="col-start-2 grid w-full max-w-[230px] min-w-0 grid-cols-4 items-center gap-1 justify-self-start">
      {metrics.map((metric) => (
        <PerformanceMetric
          key={metric.label}
          {...metric}
          className="items-center"
          valueClassName="text-[24px]"
          labelClassName="text-[10px]"
        />
      ))}
    </div>
  )
}

export function CompactPreset({ data, config }: PresetViewProps) {
  const hasRanks = config.visibility.regionRank || config.visibility.countryRank
  const hasFooter = hasRanks || config.visibility.last5Results

  return (
    <div className="flex w-[420px] max-w-full flex-col gap-2">
      <div className="grid min-h-[62px] grid-cols-[190px_minmax(0,1fr)] items-center gap-2">
        <div className="col-start-1 flex min-w-0 items-center gap-2">
          {config.visibility.level || config.visibility.challenger ? (
            <LevelMark data={data} visibility={config.visibility} className="size-12" />
          ) : null}
          <div className="flex min-w-0 flex-col items-start gap-[5px]">
            {config.visibility.nickname ? (
              <PlayerNickname
                data={data}
                className="max-w-[132px] shrink truncate text-[15px] font-bold text-[color:var(--widget-muted)]"
                showVerifiedBadge={config.visibility.verifiedBadge}
              />
            ) : null}
            {config.visibility.elo ? (
              <span className="inline-flex items-center gap-1 whitespace-nowrap text-[24px] font-extrabold leading-none tracking-[-0.035em] text-[color:var(--widget-text)] tabular-nums">
                {config.visibility.eloIcon ? <EloIcon /> : null}
                <AnimatedNumber value={data.rank.elo} />
              </span>
            ) : null}
          </div>
        </div>
        {config.visibility.last30Stats ? <CompactLast30Metrics data={data} /> : null}
      </div>

      {hasFooter ? (
        <div className="flex min-h-7 items-center justify-between gap-3 border-t border-white/10 pt-1">
          <div className="flex min-w-0 items-center gap-3">
            {config.visibility.regionRank ? (
              <RegionRank
                data={data}
                visibility={config.visibility}
                showChallengerBadge={false}
                iconSize={20}
                className="gap-1.5"
                valueClassName="text-[14px] font-bold"
              />
            ) : null}
            {config.visibility.countryRank ? (
              <CountryRank
                data={data}
                visibility={config.visibility}
                className="gap-1.5"
                valueClassName="text-[14px] font-bold"
              />
            ) : null}
          </div>
          {config.visibility.last5Results ? (
            <LastFiveResults data={data} className="mr-2 gap-[5px]" resultClassName="text-[20px] tracking-wide" />
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
