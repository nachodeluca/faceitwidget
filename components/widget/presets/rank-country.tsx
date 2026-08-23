import { isChallengerRank } from "@/lib/widget"

import { CountryRank, WorldRank } from "../parts"
import { CoreLine } from "./shared/core-line"
import type { PresetViewProps } from "./types"

export function RankCountryPreset({ data, config }: PresetViewProps) {
  const challenger = isChallengerRank(data.rank)
  const showWorldRank = config.visibility.worldRank && !challenger

  return (
    <div className="flex min-w-[232px] flex-row items-center gap-2">
      <CoreLine
        data={data}
        config={config}
        showFocusRank={challenger && config.visibility.challengerRank}
      />
      <div className="ml-auto flex items-center justify-end gap-2">
        <CountryRank data={data} visibility={config.visibility} />
        {showWorldRank ? (
          <WorldRank data={data} visibility={config.visibility} showChallengerBadge={false} />
        ) : null}
      </div>
    </div>
  )
}
