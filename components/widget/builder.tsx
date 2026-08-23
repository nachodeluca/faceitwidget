"use client"

import { useRef } from "react"

import { supportsWidgetRotation, usePlayerSnapshot, type WidgetConfig } from "@/lib/widget"
import { trackEvent } from "@/lib/analytics"

import { BuilderDialogs } from "./builder-dialogs"
import { BuilderPreview } from "./builder-preview"
import { BuilderSidebar } from "./builder-sidebar"
import { useBuilderActions } from "./use-builder-actions"
import { useBuilderConfig } from "./use-builder-config"

type BuilderProps = {
  initialConfig: WidgetConfig
  initialNickname: string
}

export function Builder({ initialConfig, initialNickname }: BuilderProps) {
  const previewWidgetRef = useRef<HTMLDivElement>(null)
  const settings = useBuilderConfig(initialConfig, initialNickname)
  const playerSnapshot = usePlayerSnapshot(settings.nickname, { debounceMs: 600, live: true })
  const actions = useBuilderActions({
    config: settings.config,
    nickname: settings.nickname,
    playerId: playerSnapshot.playerId,
    previewWidgetRef,
  })

  function handlePresetChange(preset: Parameters<typeof settings.selectPreset>[0]) {
    if (preset === settings.config.preset) return
    trackEvent("preset_selected", { preset })
    settings.selectPreset(preset)
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <BuilderSidebar
          config={settings.config}
          nickname={settings.nickname}
          rank={playerSnapshot.data?.rank}
          rotationAvailable={supportsWidgetRotation(settings.config.preset)}
          copied={actions.copied}
          canCopy={actions.canCopy}
          resetAnimationKey={settings.resetAnimationKey}
          onNicknameChange={settings.setNickname}
          onPresetChange={handlePresetChange}
          onVisibilityChange={settings.updateVisibility}
          onStyleChange={settings.updateStyle}
          onRotationChange={settings.updateRotation}
          onReset={settings.resetConfig}
          onCopy={() => void actions.copyWidgetUrl()}
          onFeedback={() => actions.setFeedbackDialogOpen(true)}
        />

        <BuilderDialogs
          copyOpen={actions.copyDialogOpen}
          feedbackOpen={actions.feedbackDialogOpen}
          widgetUrl={actions.widgetUrl}
          copied={actions.copied}
          onCopyDialogChange={actions.setCopyDialogOpen}
          onFeedbackDialogChange={actions.setFeedbackDialogOpen}
          onCopy={() => void actions.copyUrl(actions.widgetUrl)}
        />

        <BuilderPreview
          config={settings.config}
          playerSnapshot={playerSnapshot}
          previewData={playerSnapshot.data}
          previewScale={settings.previewScale}
          selectedMap={settings.selectedMap}
          previewWidgetRef={previewWidgetRef}
          exportingImage={actions.exportingImage}
          shareStatus={actions.shareStatus}
          onMapChange={settings.setSelectedMap}
          onPreviewScaleChange={settings.updatePreviewScale}
          onDownload={() => void actions.downloadPreview()}
          onShare={() => void actions.shareOnX()}
          onPresetChange={handlePresetChange}
        />
      </div>
    </main>
  )
}
