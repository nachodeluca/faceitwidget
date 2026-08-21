import {
  CountryRank,
  KdrValue,
  RegionRank,
  WorldRank,
} from "../parts"
import { CoreLine, showsChallengerWorldRank } from "./shared/core-line"
import { RotatingDetails } from "./shared/rotation-details"
import type { PresetViewProps } from "./types"

function RichHeader({ data, config }: PresetViewProps) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <div className="flex min-w-0 shrink-0 items-center gap-2">
        <WorldRank data={data} visibility={config.visibility} />
        <CoreLine
          data={data}
          config={config}
          hideChallengerMark={showsChallengerWorldRank(data, config)}
          className="gap-[6px]"
          levelClassName="size-6"
          eloValueClassName="text-[18px] tracking-[-0.03em]"
        />
      </div>
      <KdrValue
        data={data}
        visibility={config.visibility}
        className="shrink-0 flex-row items-baseline gap-1 whitespace-nowrap"
        valueClassName="text-[16px]"
        labelClassName="text-[9px] tracking-[0.04em]"
      />
      <div className="ml-auto flex shrink-0 items-center justify-end gap-2">
        <CountryRank data={data} visibility={config.visibility} />
        <RegionRank data={data} visibility={config.visibility} />
      </div>
    </div>
  )
}

export function RichStatsPreset({ data, config }: PresetViewProps) {
  return (
    <div className="flex min-w-[270px] flex-col gap-[var(--widget-layout-gap)]">
      <RichHeader data={data} config={config} />
      <RotatingDetails data={data} config={config} />
    </div>
  )
}
