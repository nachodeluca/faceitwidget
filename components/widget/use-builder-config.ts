"use client"

import { useState } from "react"

import {
  createDefaultConfig,
  normalizeConfig,
  supportsWidgetRotation,
  updateVisibilityConfig,
  type WidgetConfig,
  type WidgetMapId,
  type WidgetPresetId,
  type WidgetStyle,
  type WidgetVisibilityKey,
} from "@/lib/widget"

export function useBuilderConfig(initialConfig: WidgetConfig, initialNickname: string) {
  const [config, setConfig] = useState(() => normalizeConfig(initialConfig))
  const [nickname, setNickname] = useState(initialNickname)
  const [selectedMap, setSelectedMap] = useState<WidgetMapId>("cache")
  const [previewScale, setPreviewScale] = useState(1)
  const [resetAnimationKey, setResetAnimationKey] = useState(0)

  function updatePreviewScale(delta: number) {
    setPreviewScale((current) => Math.min(1.35, Math.max(0.7, Number((current + delta).toFixed(2)))))
  }

  function updateVisibility(key: WidgetVisibilityKey, value: boolean) {
    setConfig((current) => updateVisibilityConfig(current, key, value))
  }

  function updateStyle(patch: Partial<WidgetStyle>) {
    setConfig((current) => normalizeConfig({ ...current, style: { ...current.style, ...patch } }))
  }

  function updateRotation(patch: Partial<WidgetConfig["rotation"]>) {
    setConfig((current) => {
      if (!supportsWidgetRotation(current.preset)) return current
      return normalizeConfig({ ...current, rotation: { ...current.rotation, ...patch } })
    })
  }

  function selectPreset(preset: WidgetPresetId) {
    setConfig(createDefaultConfig(preset))
  }

  function resetConfig() {
    setConfig(createDefaultConfig())
    setResetAnimationKey((current) => current + 1)
  }

  return {
    config,
    nickname,
    selectedMap,
    previewScale,
    resetAnimationKey,
    setNickname,
    setSelectedMap,
    updatePreviewScale,
    updateVisibility,
    updateStyle,
    updateRotation,
    selectPreset,
    resetConfig,
  }
}
