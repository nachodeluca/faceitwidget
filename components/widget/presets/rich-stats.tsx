import {
  CountryRank,
  KdrValue,
  RegionRank,
} from "../parts"
import { isChallengerRank } from "@/lib/widget"

import { CoreLine } from "./shared/core-line"
import { RotatingDetails } from "./shared/rotation-details"
import type { PresetViewProps } from "./types"

function RichHeader({ data, config }: PresetViewProps) {
  const challenger = isChallengerRank(data.rank)
  const showRegionRank = config.visibility.regionRank && !challenger

  return (
    <div className="flex min-w-0 items-center gap-2">
      <div className="flex min-w-0 items-center gap-2">
        <CoreLine
          data={data}
          config={config}
          showFocusRank={challenger && config.visibility.challengerRank}
          className="gap-[6px]"
          levelClassName="size-6"
          eloValueClassName="text-[18px] tracking-[-0.03em]"
        />
      </div>
      <KdrValue
        data={data}
        visibility={config.visibility}
        className="ml-auto mr-auto shrink-0 flex-row items-baseline gap-1 whitespace-nowrap"
        valueClassName="text-[16px]"
        labelClassName="text-[9px] tracking-[0.04em]"
      />
      <div
        className={config.visibility.kdr
          ? "flex min-w-0 shrink-0 items-center justify-end gap-2"
          : "ml-auto flex min-w-0 shrink-0 items-center justify-end gap-2"}
      >
        <CountryRank data={data} visibility={config.visibility} />
        {showRegionRank ? (
          <RegionRank data={data} visibility={config.visibility} showChallengerBadge={false} />
        ) : null}
      </div>
    </div>
  )
}

export function RichStatsPreset({ data, config }: PresetViewProps) {
  return (
    <div className="flex min-w-[280px] flex-col gap-[var(--widget-layout-gap)]">
      <RichHeader data={data} config={config} />
      <RotatingDetails data={data} config={config} />
    </div>
  )
}
