import { CountryRank, KdrValue, RegionRank, WorldRank } from "../parts"
import { CoreLine, showsChallengerWorldRank } from "./shared/core-line"
import type { PresetViewProps } from "./types"

export function RankEloPreset({ data, config }: PresetViewProps) {
  return (
    <div className="flex min-w-[232px] flex-row items-center gap-3">
      <div className="flex min-w-0 shrink-0 items-center gap-3">
        <WorldRank
          data={data}
          visibility={config.visibility}
        />
        <RegionRank data={data} visibility={config.visibility} />
      </div>
      <CoreLine
        data={data}
        config={config}
        hideChallengerMark={showsChallengerWorldRank(data, config)}
      />
      {config.visibility.kdr ? (
        <KdrValue
          data={data}
          visibility={config.visibility}
          className="shrink-0 flex-row items-baseline gap-1 whitespace-nowrap"
          valueClassName="text-[16px]"
          labelClassName="text-[9px] tracking-[0.04em]"
        />
      ) : null}
      <div className="ml-auto flex shrink-0 items-center justify-end">
        <CountryRank data={data} visibility={config.visibility} />
      </div>
    </div>
  )
}
