import { CountryRank, RegionRank, WorldRank } from "../parts"
import { CoreLine, showsChallengerFocusRank, showsChallengerWorldRank } from "./shared/core-line"
import type { PresetViewProps } from "./types"

export function RankCountryPreset({ data, config }: PresetViewProps) {
  return (
    <div className="flex min-w-[232px] flex-row items-center gap-2">
      {config.visibility.worldRank ? <WorldRank data={data} visibility={config.visibility} /> : null}
      <CoreLine
        data={data}
        config={config}
        hideChallengerMark={showsChallengerWorldRank(data, config)}
        showFocusRank={showsChallengerFocusRank(data, config)}
      />
      <div className="ml-auto flex items-center justify-end gap-2">
        <RegionRank data={data} visibility={config.visibility} />
        <CountryRank data={data} visibility={config.visibility} />
      </div>
    </div>
  )
}
