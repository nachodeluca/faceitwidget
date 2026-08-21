import {
  WIDGET_PRESET_MAP,
  getRotationFields,
  type WidgetConfig,
  type WidgetData,
} from "@/lib/widget"

import { Last30Stats, PerformanceStats, StatsPanel, TodayStats } from "../../parts"
import { Rotation, type RotationItem } from "../../rotation"
import type { PresetViewProps } from "../types"

function hasMatchesToday(data: WidgetData) {
  return (data.today?.wins ?? 0) + (data.today?.losses ?? 0) > 0
}

function shouldShowTodayStats(data: WidgetData, config: WidgetConfig) {
  return config.visibility.todayStats && (config.rotation.enabled || hasMatchesToday(data))
}

function rotationItems(data: WidgetData, config: WidgetConfig): RotationItem[] {
  const items: RotationItem[] = []

  if (shouldShowTodayStats(data, config)) {
    items.push({
      id: "today",
      content: (
        <StatsPanel title="Stats today">
          <TodayStats data={data} />
        </StatsPanel>
      ),
    })
  }

  if (config.visibility.last30Stats) {
    items.push({
      id: "last30",
      content: (
        <StatsPanel title="Last 30 matches">
          <Last30Stats data={data} />
        </StatsPanel>
      ),
    })
  }

  if (config.visibility.kdr && getRotationFields(config.preset).includes("lifetime")) {
    items.push({
      id: "lifetime",
      content: (
        <StatsPanel>
          <PerformanceStats data={data} />
        </StatsPanel>
      ),
    })
  }

  return items
}

function orderedRotationItems(items: RotationItem[], config: WidgetConfig) {
  const preferredField = WIDGET_PRESET_MAP[config.preset]?.defaultRotationFields?.[0]
  if (!preferredField) return items

  return [...items].sort(
    (left, right) => Number(right.id === preferredField) - Number(left.id === preferredField),
  )
}

function selectedRotationItems(items: RotationItem[], config: WidgetConfig) {
  const orderedItems = orderedRotationItems(items, config)
  const selected = config.rotation.fields
    .map((field) => orderedItems.find((item) => item.id === field))
    .filter((item): item is RotationItem => Boolean(item))

  return config.rotation.enabled && selected.length > 0 ? selected : orderedItems
}

export function RotatingDetails({ data, config }: PresetViewProps) {
  return (
    <Rotation
      key={`${config.preset}:${config.rotation.enabled}:${config.rotation.fields.join(",")}`}
      items={selectedRotationItems(rotationItems(data, config), config)}
      enabled={config.rotation.enabled}
      intervalMs={config.rotation.intervalMs}
    />
  )
}
