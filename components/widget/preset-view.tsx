import { renderPreset } from "./presets/registry"
import type { PresetViewProps } from "./presets/types"

export function PresetView({ data, config }: PresetViewProps) {
  return renderPreset(config.preset, { data, config })
}
