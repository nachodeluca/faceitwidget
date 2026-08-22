"use client"

import { useSearchParams } from "next/navigation"
import { useEffect } from "react"

import { Builder } from "@/components/widget/builder"
import { TooltipProvider } from "@/components/ui/tooltip"
import { trackEvent } from "@/lib/analytics"
import {
  createDefaultConfig,
  deserializeConfig,
  WIDGET_PRESETS,
  type WidgetPresetId,
} from "@/lib/widget"

function getPreset(value: string | null): WidgetPresetId {
  return WIDGET_PRESETS.find((preset) => preset.id === value)?.id ?? "elo-pill"
}

export function BuilderClient() {
  const searchParams = useSearchParams()
  const nickname = searchParams.get("nickname")?.trim() ?? ""
  const serializedConfig = searchParams.get("config")
  const config = serializedConfig
    ? deserializeConfig(serializedConfig)
    : createDefaultConfig(getPreset(searchParams.get("preset")))

  useEffect(() => {
    trackEvent("builder_opened", { preset: config.preset })
  }, [config.preset])

  return (
    <TooltipProvider>
      <Builder
        key={`${nickname}:${serializedConfig ?? searchParams.get("preset") ?? "elo-pill"}`}
        initialConfig={config}
        initialNickname={nickname}
      />
    </TooltipProvider>
  )
}
