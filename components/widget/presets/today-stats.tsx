import { CoreLine } from "./shared/core-line"
import { RotatingDetails } from "./shared/rotation-details"
import type { PresetViewProps } from "./types"

export function TodayStatsPreset({ data, config }: PresetViewProps) {
  return (
    <div className="flex min-w-[264px] flex-col gap-[var(--widget-layout-gap)]">
      <CoreLine data={data} config={config} />
      <RotatingDetails data={data} config={config} />
    </div>
  )
}
