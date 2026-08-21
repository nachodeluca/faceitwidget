import {
  ChallengerMark,
  CountryFlag,
  EloSummary,
  getChallengerRankColor,
  PlayerNickname,
  RankValue,
  RecordStat,
} from "../parts"
import { showsChallengerWorldRank } from "./shared/core-line"
import type { PresetViewProps } from "./types"
import { isChallengerRank } from "@/lib/widget"

export function ProfileCardPreset({ data, config }: PresetViewProps) {
  const showRankMark = showsChallengerWorldRank(data, config)
  const showWorldRankNumber = !isChallengerRank(data.rank) || config.visibility.challengerRank

  return (
    <div className="flex min-w-[252px] flex-row items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-2">
        {showRankMark ? (
          <ChallengerMark
            className="block size-[34px] shrink-0 object-contain"
            accentColor={getChallengerRankColor(data.rank.worldRank)}
          />
        ) : null}
        <div className="flex min-w-0 flex-col gap-[5px]">
          {config.visibility.nickname ? (
            <div className="flex min-w-0 items-center gap-[6px]">
              <PlayerNickname data={data} className="text-[14px] font-extrabold" />
            </div>
          ) : null}
          <div className="flex min-w-0 items-center gap-1 whitespace-nowrap text-[9px] leading-none text-[color:var(--widget-muted)]">
            {config.visibility.worldRank && showWorldRankNumber ? (
              <RankValue
                className="gap-0"
                value={data.rank.worldRank}
                valueClassName="text-[9px] font-bold text-[color:var(--widget-muted)]"
              />
            ) : null}
            {config.visibility.countryRank ? <CountryFlag data={data} className="h-3 w-[17px]" /> : null}
            {config.visibility.worldRank && showWorldRankNumber && config.visibility.elo ? <span>/</span> : null}
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
