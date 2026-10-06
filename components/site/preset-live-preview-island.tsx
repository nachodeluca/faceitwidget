"use client"

import { PlayerDataBoundary } from "@/components/widget/player-data-boundary"
import { Widget } from "@/components/widget/widget"
import { WidgetDataStatus } from "@/components/widget/widget-placeholder"
import { createDefaultConfig, usePlayerSnapshot, type WidgetPresetId } from "@/lib/widget"

import { PresetPreviewPlaceholder, PresetPreviewZoom } from "./preset-preview-frame"

type PresetLivePreviewIslandProps = {
  presetId: WidgetPresetId
  nickname: string
}

export function PresetLivePreviewIsland({ presetId, nickname }: PresetLivePreviewIslandProps) {
  const snapshot = usePlayerSnapshot(nickname)

  return (
    <PlayerDataBoundary
      state={snapshot}
      pending={<PresetPreviewPlaceholder />}
      failed={() => <WidgetDataStatus message="Live stats are unavailable right now." />}
    >
      {(data) => (
        <PresetPreviewZoom presetId={presetId}>
          <Widget data={data} config={createDefaultConfig(presetId)} />
        </PresetPreviewZoom>
      )}
    </PlayerDataBoundary>
  )
}
