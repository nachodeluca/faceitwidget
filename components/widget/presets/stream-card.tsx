import { Identity } from "../parts"
import { CoreLine } from "./shared/core-line"
import { RotatingDetails } from "./shared/rotation-details"
import type { PresetViewProps } from "./types"

export function StreamCardPreset({ data, config }: PresetViewProps) {
  return (
    <div className="flex min-w-[284px] flex-col gap-[var(--widget-layout-gap)]">
      <div className="flex items-center justify-between gap-[10px]">
        <Identity data={data} visibility={config.visibility} />
        <CoreLine
          data={data}
          config={config}
          hideChallengerMark={config.visibility.challenger}
        />
      </div>
      <RotatingDetails data={data} config={config} />
    </div>
  )
}
