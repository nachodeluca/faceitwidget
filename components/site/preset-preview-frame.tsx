"use client"

import { createContext, useContext, type ReactNode } from "react"

import { WidgetSkeleton } from "@/components/widget/widget-placeholder"
import { WIDGET_PRESET_MAP } from "@/lib/widget/config/presets"
import type { WidgetPresetId, WidgetPreviewSize } from "@/lib/widget/types"
import { cn } from "@/lib/utils"

// Fixed stage heights reserve the preview's space before the client island loads, so the live
// widget never shifts the server-rendered copy below it. Zoom keeps each layout crisp and
// within the article column (stage is ~280px wide at a 320px viewport, ~696px on desktop).
const previewLayout: Record<WidgetPreviewSize, { stage: string; zoom: string }> = {
  pill: { stage: "h-[112px] sm:h-[152px]", zoom: "[zoom:1] sm:[zoom:1.5]" },
  card: { stage: "h-[152px] sm:h-[232px]", zoom: "[zoom:0.76] sm:[zoom:1.4]" },
  compact: { stage: "h-[128px] sm:h-[216px]", zoom: "[zoom:0.6] sm:[zoom:1.2]" },
}

const PresetPreviewContext = createContext<WidgetPresetId>("elo-pill")

function previewSize(presetId: WidgetPresetId) {
  return WIDGET_PRESET_MAP[presetId].previewSize
}

export function PresetPreviewZoom({ presetId, children }: { presetId: WidgetPresetId; children: ReactNode }) {
  return <div className={previewLayout[previewSize(presetId)].zoom}>{children}</div>
}

export function PresetPreviewPlaceholder() {
  const presetId = useContext(PresetPreviewContext)

  return (
    <div role="status" aria-label="Loading live widget preview">
      <PresetPreviewZoom presetId={presetId}>
        <WidgetSkeleton size={previewSize(presetId)} />
      </PresetPreviewZoom>
    </div>
  )
}

export function PresetPreviewFrame({ presetId, children }: { presetId: WidgetPresetId; children: ReactNode }) {
  return (
    <PresetPreviewContext value={presetId}>
      <div
        data-preview-stage
        className={cn(
          "relative isolate grid w-full place-items-center overflow-hidden rounded-md border border-border bg-surface [background-image:radial-gradient(rgb(255_255_255_/_5%)_1px,transparent_1px)] [background-size:16px_16px]",
          previewLayout[previewSize(presetId)].stage,
        )}
      >
        {children}
      </div>
    </PresetPreviewContext>
  )
}
