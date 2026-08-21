import type { WidgetPresetId } from "@/lib/widget"

import { EloPillPreset } from "./elo-pill"
import { ProfileCardPreset } from "./profile-card"
import { RankCountryPreset } from "./rank-country"
import { RankEloPreset } from "./rank-elo"
import { RichStatsPreset } from "./rich-stats"
import { StreamCardPreset } from "./stream-card"
import { TodayStatsPreset } from "./today-stats"
import type { PresetRenderer, PresetViewProps } from "./types"

const presetRegistry: Record<WidgetPresetId, PresetRenderer> = {
  "elo-pill": (props: PresetViewProps) => <EloPillPreset {...props} />,
  "rank-elo": (props: PresetViewProps) => <RankEloPreset {...props} />,
  "rank-country": (props: PresetViewProps) => <RankCountryPreset {...props} />,
  "today-stats": (props: PresetViewProps) => <TodayStatsPreset {...props} />,
  "rich-profile": (props: PresetViewProps) => <RichStatsPreset {...props} />,
  "rich-history": (props: PresetViewProps) => <RichStatsPreset {...props} />,
  "stream-card": (props: PresetViewProps) => <StreamCardPreset {...props} />,
  "profile-card": (props: PresetViewProps) => <ProfileCardPreset {...props} />,
}

export function renderPreset(preset: WidgetPresetId, props: PresetViewProps) {
  return (presetRegistry[preset] ?? presetRegistry["elo-pill"])(props)
}
