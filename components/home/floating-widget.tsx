import Link from "next/link"

import {
  createDefaultConfig,
  WIDGET_PRESET_MAP,
  type WidgetData,
  type WidgetPresetId,
} from "@/lib/widget"
import { cn } from "@/lib/utils"

import { Widget, type WidgetShadow } from "../widget/widget"

type FloatingWidgetProps = {
  className?: string
  data: WidgetData
  preset: WidgetPresetId
  shadow?: WidgetShadow
}

export function FloatingWidget({ className, data, preset, shadow = "none" }: FloatingWidgetProps) {
  return (
    <Link
      href={{ pathname: "/builder", query: { nickname: data.profile.nickname, preset } }}
      prefetch={false}
      className={cn(
        "inline-block rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring/70",
        className,
      )}
    >
      <Widget data={data} config={createDefaultConfig(preset)} shadow={shadow} />
      <span className="sr-only">Open {WIDGET_PRESET_MAP[preset].label} in builder</span>
    </Link>
  )
}
