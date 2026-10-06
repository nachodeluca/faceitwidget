import { WIDGET_PRESETS, type WidgetPreset } from "@/lib/widget/config/presets"
import type { WidgetVisibilityKey } from "@/lib/widget/types"
import { visibilityLabel } from "@/lib/widget/visibility-labels"
import { APP_PATHS, presetPath } from "@/lib/site-metadata"

const capturePriority: WidgetVisibilityKey[] = [
  "elo",
  "level",
  "challenger",
  "challengerRank",
  "regionRank",
  "countryRank",
  "kdr",
  "todayStats",
  "last30Stats",
  "last5Results",
  "avgKills",
  "headshotRate",
  "winRate",
  "rankProgress",
  "nickname",
]

export function getPresetById(presetId: string): WidgetPreset | undefined {
  return WIDGET_PRESETS.find((preset) => preset.id === presetId)
}

export function getVisibleFieldKeys(preset: WidgetPreset): WidgetVisibilityKey[] {
  return capturePriority.filter((key) => preset.defaultVisibility[key])
}

export function getEditableFieldLabels(preset: WidgetPreset): string[] {
  return preset.editableFields.map(visibilityLabel)
}

export function getCaptureSummary(preset: WidgetPreset): string {
  const labels = getVisibleFieldKeys(preset).map(visibilityLabel)
  if (labels.length === 0) return preset.description
  if (labels.length === 1) return `Shows ${labels[0]}.`
  if (labels.length === 2) return `Shows ${labels[0]} and ${labels[1]}.`
  return `Shows ${labels.slice(0, -1).join(", ")}, and ${labels.at(-1)}.`
}

export const PRESET_PREVIEW_NICKNAME = "donk666"

export function builderPresetHref(presetId: string, nickname = PRESET_PREVIEW_NICKNAME) {
  return `${APP_PATHS.builder}?preset=${encodeURIComponent(presetId)}&nickname=${encodeURIComponent(nickname)}`
}

export function presetLandingTitle(preset: WidgetPreset) {
  return `${preset.label} FACEIT Widget Preset`
}

export function presetLandingDescription(preset: WidgetPreset) {
  return `${preset.description}. Build a free ${preset.label} FACEIT CS2 overlay for OBS or Streamlabs with live stats and a Browser Source URL.`
}

export function allPresetLinks() {
  return WIDGET_PRESETS.map((preset) => ({
    id: preset.id,
    label: preset.label,
    description: preset.description,
    href: presetPath(preset.id),
  }))
}
