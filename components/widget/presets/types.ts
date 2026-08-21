import type { ReactNode } from "react"
import type { WidgetConfig, WidgetData } from "@/lib/widget"

export type PresetViewProps = {
  data: WidgetData
  config: WidgetConfig
}

export type PresetRenderer = (props: PresetViewProps) => ReactNode
