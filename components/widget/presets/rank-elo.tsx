import { isChallengerRank } from "@/lib/widget"

import { CountryRank, KdrValue, WorldRank } from "../parts"
import { CoreLine } from "./shared/core-line"
import type { PresetViewProps } from "./types"

export function RankEloPreset({ data, config }: PresetViewProps) {
  const challenger = isChallengerRank(data.rank)
  const showWorldRank = config.visibility.worldRank && !challenger

  return (
    <div className="flex min-w-[232px] flex-row items-center gap-3">
      <CoreLine
        data={data}
        config={config}
        showFocusRank={challenger && config.visibility.challengerRank}
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
      <div className="ml-auto flex shrink-0 items-center justify-end gap-2">
        <CountryRank data={data} visibility={config.visibility} />
        {showWorldRank ? (
          <WorldRank data={data} visibility={config.visibility} showChallengerBadge={false} />
        ) : null}
      </div>
    </div>
  )
}
