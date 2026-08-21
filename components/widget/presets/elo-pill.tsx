import { LastFiveResults } from "../parts"
import { CoreLine } from "./shared/core-line"
import type { PresetViewProps } from "./types"

export function EloPillPreset({ data, config }: PresetViewProps) {
  return (
    <div className="flex min-w-[116px] items-center justify-center gap-2">
      <CoreLine
        data={data}
        config={config}
        showFocusRank={config.visibility.challengerRank}
      />
      {config.visibility.last5Results ? <LastFiveResults data={data} /> : null}
    </div>
  )
}
