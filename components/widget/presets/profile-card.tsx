import {
  ChallengerRankBadge,
  CountryRank,
  EloSummary,
  LevelMark,
  PlayerNickname,
  RecordStat,
  WorldRank,
} from "../parts"
import { isChallengerRank } from "@/lib/widget"
import type { PresetViewProps } from "./types"

export function ProfileCardPreset({ data, config }: PresetViewProps) {
  const challenger = isChallengerRank(data.rank)
  const showRankMark = challenger && config.visibility.challenger
  const showChallengerRank = challenger && config.visibility.challengerRank
  const showWorldRank = config.visibility.worldRank && !challenger
  const showCountryRank = config.visibility.countryRank
  const showAnyRank = showCountryRank || showWorldRank
  const compactRankClass = "gap-1"
  const compactRankValueClass = "text-[9px] font-bold text-[color:var(--widget-muted)]"

  return (
    <div className="flex min-w-[252px] flex-row items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-2">
        {showRankMark ? (
          <ChallengerRankBadge
            value={data.rank.worldRank}
            showRankNumber={showChallengerRank}
          />
        ) : (
          <LevelMark data={data} visibility={config.visibility} className="size-[34px]" />
        )}
        <div className="flex min-w-0 flex-col gap-[5px]">
          {config.visibility.nickname ? (
            <div className="flex min-w-0 items-center gap-[6px]">
              <PlayerNickname data={data} className="text-[14px] font-extrabold" />
            </div>
          ) : null}
          <div className="flex min-w-0 items-center gap-1 whitespace-nowrap text-[9px] leading-none text-[color:var(--widget-muted)]">
            {showCountryRank ? (
              <CountryRank
                data={data}
                visibility={config.visibility}
                className={compactRankClass}
                flagClassName="h-3 w-[17px]"
                valueClassName={compactRankValueClass}
              />
            ) : null}
            {showCountryRank && showWorldRank ? <span>/</span> : null}
            {showWorldRank ? (
              <WorldRank
                data={data}
                visibility={config.visibility}
                showChallengerBadge={false}
                className={compactRankClass}
                valueClassName={compactRankValueClass}
              />
            ) : null}
            {config.visibility.elo && showAnyRank ? <span>/</span> : null}
            <EloSummary data={data} visibility={config.visibility} />
          </div>
        </div>
      </div>
      {config.visibility.todayStats ? (
        <div className="grid shrink-0 grid-cols-[repeat(2,34px)] gap-[5px]" aria-label="Wins and losses">
          <RecordStat label="wins" value={data.today?.wins} tone="positive" />
          <RecordStat label="losses" value={data.today?.losses} tone="negative" />
        </div>
      ) : null}
    </div>
  )
}
