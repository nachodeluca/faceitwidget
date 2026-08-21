import { isChallengerRank } from "@/lib/widget"

import { PlayerNickname } from "../parts"
import { CoreLine } from "./shared/core-line"
import { RotatingDetails } from "./shared/rotation-details"
import type { PresetViewProps } from "./types"

export function TodayStatsPreset({ data, config }: PresetViewProps) {
  return (
    <div className="flex min-w-[264px] flex-col gap-[var(--widget-layout-gap)]">
      <div className="flex min-w-0 items-center justify-between gap-3">
        <CoreLine
          data={data}
          config={config}
          showFocusRank={isChallengerRank(data.rank) && config.visibility.challengerRank}
        />
        {config.visibility.nickname ? (
          <PlayerNickname data={data} className="max-w-[9rem] truncate text-right" />
        ) : null}
      </div>
      <RotatingDetails data={data} config={config} />
    </div>
  )
}
