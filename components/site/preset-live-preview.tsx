"use client"

import dynamic from "next/dynamic"

import type { WidgetPresetId } from "@/lib/widget/types"

import { PresetPreviewFrame, PresetPreviewPlaceholder } from "./preset-preview-frame"

// Client-only island: the widget renderer and snapshot client load only on preset pages.
const PresetLivePreviewIsland = dynamic(
  () => import("./preset-live-preview-island").then((module) => module.PresetLivePreviewIsland),
  {
    loading: () => <PresetPreviewPlaceholder />,
    ssr: false,
  },
)

type PresetLivePreviewProps = {
  presetId: WidgetPresetId
  nickname: string
}

export function PresetLivePreview({ presetId, nickname }: PresetLivePreviewProps) {
  return (
    <PresetPreviewFrame presetId={presetId}>
      <PresetLivePreviewIsland presetId={presetId} nickname={nickname} />
    </PresetPreviewFrame>
  )
}
