"use client"

import type { CSSProperties, Ref } from "react"

import { normalizeConfig, type WidgetConfig, type WidgetData } from "@/lib/widget"
import { cn } from "@/lib/utils"

import { PresetView } from "./preset-view"

const fontStacks = {
  outfit: "var(--font-outfit-loaded), Arial, Helvetica, sans-serif",
  system: "Inter, ui-sans-serif, system-ui, sans-serif",
  mono: "ui-monospace, SFMono-Regular, Menlo, monospace",
} as const

type WidgetProps = {
  data: WidgetData
  config?: WidgetConfig
  className?: string
  shadow?: WidgetShadow
  ref?: Ref<HTMLDivElement>
}

export type WidgetShadow = "default" | "subtle" | "none"

export function Widget({ data, config: rawConfig, className, shadow = "default", ref }: WidgetProps) {
  const config = normalizeConfig(rawConfig)
  const style = {
    "--widget-accent": config.style.accent,
    "--widget-text": config.style.text,
    "--widget-muted": config.style.mutedText,
    "--widget-surface": config.style.surface,
    "--widget-surface-muted": config.style.surfaceMuted,
    "--widget-border": config.style.border,
    "--widget-radius": `${config.style.radius}px`,
    "--widget-scale": config.style.scale,
    "--widget-opacity": config.style.opacity,
    "--widget-font": fontStacks[config.style.font],
    "--widget-layout-gap": config.style.density === "comfortable" ? "12px" : "6px",
  } as CSSProperties
  const surfaceBorderClass =
    config.style.background === "none" || !config.style.borderEnabled
      ? "border-transparent"
      : "border-[color:var(--widget-border)]"
  const surfaceBackgroundClass =
    config.style.background === "none" ? "bg-transparent" : "bg-[color:var(--widget-surface)]"
  const surfaceShadowClass =
    config.style.background === "none" || shadow === "none"
      ? "shadow-none"
      : shadow === "subtle"
        ? "shadow-[0_6px_18px_rgb(0_0_0_/_14%)]"
        : "shadow-[0_12px_32px_rgb(0_0_0_/_22%)]"
  const surfacePaddingClass = config.style.density === "comfortable" ? "px-4 py-3" : "px-3 py-2"
  const transparentTextClass =
    config.style.background === "none" ? "[text-shadow:0_1px_2px_rgb(0_0_0_/_90%)]" : null

  return (
    <div
      ref={ref}
      className={cn(
        "inline-block max-w-full origin-top-left text-[12px] font-normal leading-none text-[color:var(--widget-text)] opacity-[var(--widget-opacity)] [font-family:var(--widget-font)] [transform:scale(var(--widget-scale))]",
        transparentTextClass,
        className,
      )}
      style={style}
      data-background={config.style.background}
      aria-label={`${data.profile.nickname} FACEIT stats`}
    >
      <div
        data-widget-surface
        className={cn(
          "block w-max max-w-full rounded-[var(--widget-radius)] border",
          surfacePaddingClass,
          surfaceBorderClass,
          surfaceBackgroundClass,
          surfaceShadowClass,
        )}
      >
        <PresetView data={data} config={config} />
      </div>
    </div>
  )
}
