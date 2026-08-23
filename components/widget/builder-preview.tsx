import Image from "next/image"
import type { CSSProperties, RefObject } from "react"
import {
  Check,
  ImageDown,
  LoaderCircle,
  Map as MapIcon,
  Minus,
  Plus,
  Share2,
} from "lucide-react"

import {
  createDefaultConfig,
  supportsWidgetRotation,
  WIDGET_MAPS,
  WIDGET_PRESETS,
  type PlayerSnapshotState,
  type WidgetConfig,
  type WidgetData,
  type WidgetBackdropPosition,
  type WidgetMapId,
  type WidgetPresetId,
} from "@/lib/widget"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

import { PlayerDataBoundary } from "./player-data-boundary"
import type { ShareStatus } from "./builder-types"
import { BackdropPosterPreloads } from "./background"
import { MapIconPreloads } from "./map-icon-preloads"
import { PresetSuggestionCard } from "./preset-suggestion-card"
import { Widget } from "./widget"
import { WidgetDataStatus, WidgetSkeleton } from "./widget-placeholder"

export const DOWNLOAD_WIDGET_LABEL = "Download widget as PNG"
export const SHARE_WIDGET_LABEL = "Copy widget URL and share on X"

const layoutPreviewScales: Record<WidgetPresetId, number> = {
  "elo-pill": 0.92,
  "rank-elo": 0.7,
  "rank-country": 0.68,
  "today-stats": 0.63,
  "rich-profile": 0.64,
  "rich-history": 0.64,
  "profile-card": 0.68,
}

const previewBackgrounds = {
  none: "bg-[#151515] [background-image:linear-gradient(45deg,rgb(255_255_255_/_4%)_25%,transparent_25%),linear-gradient(-45deg,rgb(255_255_255_/_4%)_25%,transparent_25%),linear-gradient(45deg,transparent_75%,rgb(255_255_255_/_4%)_75%),linear-gradient(-45deg,transparent_75%,rgb(255_255_255_/_4%)_75%)] [background-position:0_0,0_8px,8px_-8px,-8px_0] [background-size:16px_16px]",
  solid: "bg-surface [background-image:radial-gradient(rgb(255_255_255_/_5%)_1px,transparent_1px)] [background-size:16px_16px]",
} as const

function MapPreviewIcon({
  map,
  className,
}: {
  map: (typeof WIDGET_MAPS)[number]
  className?: string
}) {
  if (!map.iconSrc) {
    return <MapIcon aria-hidden="true" className={cn("size-4 text-muted-foreground", className)} />
  }

  return (
    <Image
      src={map.iconSrc}
      alt=""
      aria-hidden="true"
      width={24}
      height={24}
      className={cn("size-4 shrink-0 rounded-[3px] object-cover", className)}
    />
  )
}

function LayoutPreview({ state, presetId }: { state: PlayerSnapshotState; presetId: WidgetPresetId }) {
  const placeholder = <WidgetSkeleton size={supportsWidgetRotation(presetId) ? "card" : "pill"} />

  return (
    <div className="relative flex h-[104px] w-full items-center justify-center overflow-hidden rounded-[calc(var(--radius-md)-2px)] bg-background/70">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgb(255_255_255_/_5%),transparent_68%)]" />
      <div
        className="relative z-[1] origin-center transition-transform duration-200 ease-[var(--ease-out)]"
        style={{ transform: `scale(${layoutPreviewScales[presetId]})` }}
      >
        <PlayerDataBoundary state={state} pending={placeholder} failed={() => placeholder}>
          {(data) => <Widget data={data} config={createDefaultConfig(presetId)} />}
        </PlayerDataBoundary>
      </div>
    </div>
  )
}

type PreviewStageProps = {
  config: WidgetConfig
  playerSnapshot: PlayerSnapshotState
  previewData: WidgetData | null
  previewScale: number
  activeMap: (typeof WIDGET_MAPS)[number]
  previewWidgetRef: RefObject<HTMLDivElement | null>
  exportingImage: boolean
  shareStatus: ShareStatus
  onPreviewScaleChange: (delta: number) => void
  onBackdropPositionChange: (position: WidgetBackdropPosition) => void
  onDownload: () => void
  onShare: () => void
}

function PreviewStage({
  config,
  playerSnapshot,
  previewData,
  previewScale,
  activeMap,
  previewWidgetRef,
  exportingImage,
  shareStatus,
  onPreviewScaleChange,
  onBackdropPositionChange,
  onDownload,
  onShare,
}: PreviewStageProps) {
  const style = {
    "--builder-map-image": activeMap.src ? `url("${activeMap.src}")` : "none",
  } as CSSProperties

  return (
    <div
      className={cn(
        "relative isolate grid min-h-[500px] place-items-center overflow-hidden rounded-md border border-border max-[520px]:min-h-[360px]",
        previewBackgrounds[config.style.background],
      )}
      data-background={config.style.background}
      data-map={activeMap.id}
      style={style}
    >
      <div
        className="pointer-events-none absolute inset-0 z-0 bg-cover bg-center [background-image:linear-gradient(180deg,rgb(8_8_8_/_52%),rgb(8_8_8_/_78%)),var(--builder-map-image,none)] [filter:saturate(.55)_brightness(.62)] data-[map=none]:hidden"
        data-map={activeMap.id}
      />
      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgb(0_0_0_/_18%)_100%)]" />
      <PreviewActions
        previewData={previewData}
        previewScale={previewScale}
        exportingImage={exportingImage}
        shareStatus={shareStatus}
        onPreviewScaleChange={onPreviewScaleChange}
        onDownload={onDownload}
        onShare={onShare}
      />
      <div
        className="relative z-[1] origin-center transition-transform duration-200 ease-[var(--ease-out)]"
        style={{ transform: `scale(${previewScale})` }}
      >
        <PlayerDataBoundary
          state={playerSnapshot}
          idle={<WidgetDataStatus message="Enter a FACEIT nickname." />}
          pending={<WidgetDataStatus loading message="Loading FACEIT stats..." />}
          failed={(message) => <WidgetDataStatus message={message} />}
        >
          {(data) => (
            <Widget
              ref={previewWidgetRef}
              data={data}
              config={config}
              className="origin-center"
              backdropInteraction={
                config.backdrop.id === "none"
                  ? undefined
                  : { onPositionChange: onBackdropPositionChange }
              }
            />
          )}
        </PlayerDataBoundary>
      </div>
    </div>
  )
}

type PreviewActionProps = Pick<
  PreviewStageProps,
  "previewData" | "previewScale" | "exportingImage" | "shareStatus" | "onPreviewScaleChange" | "onDownload" | "onShare"
>

function ExportButton({ previewData, exportingImage, onDownload }: Pick<PreviewActionProps, "previewData" | "exportingImage" | "onDownload">) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            icon={exportingImage ? <LoaderCircle className="animate-spin motion-reduce:animate-none" /> : <ImageDown />}
            onClick={onDownload}
            disabled={!previewData || exportingImage}
            aria-label={DOWNLOAD_WIDGET_LABEL}
          />
        }
      />
      <TooltipContent>{DOWNLOAD_WIDGET_LABEL}</TooltipContent>
    </Tooltip>
  )
}

function ShareButton({ previewData, shareStatus, onShare }: Pick<PreviewActionProps, "previewData" | "shareStatus" | "onShare">) {
  const icon =
    shareStatus === "preparing" ? (
      <LoaderCircle className="animate-spin motion-reduce:animate-none" />
    ) : shareStatus === "opened" ? (
      <Check className="text-emerald-400" />
    ) : (
      <Share2 className={shareStatus === "error" ? "text-destructive" : undefined} />
    )

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            icon={icon}
            onClick={onShare}
            disabled={!previewData || shareStatus === "preparing"}
            aria-label={SHARE_WIDGET_LABEL}
          />
        }
      />
      <TooltipContent>{SHARE_WIDGET_LABEL}</TooltipContent>
    </Tooltip>
  )
}

function ScaleControls({ previewScale, onPreviewScaleChange }: Pick<PreviewActionProps, "previewScale" | "onPreviewScaleChange">) {
  return (
    <>
      <Button
        variant="ghost"
        size="icon-sm"
        icon={<Minus />}
        onClick={() => onPreviewScaleChange(-0.1)}
        disabled={previewScale <= 0.7}
        aria-label="Make preview smaller"
        title="Make preview smaller"
      />
      <span className="min-w-11 px-1 text-center text-[11px] font-medium tabular-nums text-muted-foreground">
        {Math.round(previewScale * 100)}%
      </span>
      <Button
        variant="ghost"
        size="icon-sm"
        icon={<Plus />}
        onClick={() => onPreviewScaleChange(0.1)}
        disabled={previewScale >= 1.35}
        aria-label="Make preview larger"
        title="Make preview larger"
      />
    </>
  )
}

function PreviewActions({
  previewData,
  previewScale,
  exportingImage,
  shareStatus,
  onPreviewScaleChange,
  onDownload,
  onShare,
}: PreviewActionProps) {
  return (
    <div className="absolute right-3 top-3 z-10 flex items-center gap-0.5 rounded-lg border border-border/80 bg-surface/90 p-1 shadow-[0_8px_24px_rgb(0_0_0_/_24%)] backdrop-blur-sm">
      <ExportButton previewData={previewData} exportingImage={exportingImage} onDownload={onDownload} />
      <ShareButton previewData={previewData} shareStatus={shareStatus} onShare={onShare} />
      <span aria-hidden="true" className="mx-1 h-5 w-px bg-border" />
      <ScaleControls previewScale={previewScale} onPreviewScaleChange={onPreviewScaleChange} />
    </div>
  )
}

type LayoutGridProps = {
  state: PlayerSnapshotState
  selectedPreset: WidgetPresetId
  onPresetChange: (preset: WidgetPresetId) => void
}

function LayoutGrid({ state, selectedPreset, onPresetChange }: LayoutGridProps) {
  return (
    <div className="mt-2 grid grid-cols-[repeat(auto-fit,minmax(210px,1fr))] gap-2">
      {WIDGET_PRESETS.map((preset) => {
        const selected = preset.id === selectedPreset

        return (
          <div
            className="group rounded-md border border-border bg-surface p-1.5 text-on-surface transition-[border-color,background-color,transform,box-shadow] duration-150 ease-[var(--ease-out)] hover:border-foreground/40 hover:bg-surface-2 active:scale-[0.985] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40 data-[active=true]:border-primary data-[active=true]:bg-surface-2 data-[active=true]:shadow-[inset_0_0_0_1px_var(--primary)]"
            data-active={selected}
            aria-pressed={selected}
            aria-label={preset.label}
            key={preset.id}
            role="button"
            tabIndex={0}
            onClick={() => onPresetChange(preset.id)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault()
                onPresetChange(preset.id)
              }
            }}
          >
            <LayoutPreview state={state} presetId={preset.id} />
          </div>
        )
      })}
      <PresetSuggestionCard />
    </div>
  )
}

type BuilderPreviewProps = {
  config: WidgetConfig
  playerSnapshot: PlayerSnapshotState
  previewData: WidgetData | null
  previewScale: number
  selectedMap: WidgetMapId
  previewWidgetRef: RefObject<HTMLDivElement | null>
  exportingImage: boolean
  shareStatus: ShareStatus
  onMapChange: (map: WidgetMapId) => void
  onBackdropPositionChange: (position: WidgetBackdropPosition) => void
  onPreviewScaleChange: (delta: number) => void
  onDownload: () => void
  onShare: () => void
  onPresetChange: (preset: WidgetPresetId) => void
}

function PreviewHeader({
  selectedMap,
  activeMap,
  activePreset,
  onMapChange,
}: {
  selectedMap: WidgetMapId
  activeMap: (typeof WIDGET_MAPS)[number]
  activePreset: (typeof WIDGET_PRESETS)[number]
  onMapChange: (map: WidgetMapId) => void
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4 max-[520px]:items-start max-[520px]:flex-col">
      <div>
        <p className="text-label-sm text-tertiary">PREVIEW</p>
        <div className="mt-1 flex items-center gap-2 text-sm">
          <h2 className="font-semibold text-on-surface">{activePreset.label}</h2>
          <span className="text-border">/</span>
          <span className="text-muted-foreground">{activeMap.label}</span>
        </div>
      </div>
      <div className="flex items-end gap-2">
        <div className="flex flex-col gap-1.5">
          <Label className="text-[11px] leading-none text-muted-foreground" htmlFor="preview-map">
            Map
          </Label>
          <Select
            items={WIDGET_MAPS.map((map) => ({ value: map.id, label: map.label }))}
            value={selectedMap}
            onValueChange={(value) => {
              if (WIDGET_MAPS.some((map) => map.id === value)) onMapChange(value as WidgetMapId)
            }}
          >
            <SelectTrigger id="preview-map" className="h-8 w-[132px]">
              <MapPreviewIcon map={activeMap} />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {WIDGET_MAPS.map((map) => (
                <SelectItem key={map.id} value={map.id} label={map.label}>
                  <MapPreviewIcon map={map} />
                  {map.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}

export function BuilderPreview({
  config,
  playerSnapshot,
  previewData,
  previewScale,
  selectedMap,
  previewWidgetRef,
  exportingImage,
  shareStatus,
  onMapChange,
  onBackdropPositionChange,
  onPreviewScaleChange,
  onDownload,
  onShare,
  onPresetChange,
}: BuilderPreviewProps) {
  const activeMap = WIDGET_MAPS.find((map) => map.id === selectedMap) ?? WIDGET_MAPS[0]
  const activePreset = WIDGET_PRESETS.find((preset) => preset.id === config.preset) ?? WIDGET_PRESETS[0]

  return (
    <section className="min-w-0 flex-1 bg-background">
      <MapIconPreloads />
      <BackdropPosterPreloads />
      <div className="mx-auto w-full max-w-[1280px] px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
        <PreviewHeader
          selectedMap={selectedMap}
          activeMap={activeMap}
          activePreset={activePreset}
          onMapChange={onMapChange}
        />

        <PreviewStage
          config={config}
          playerSnapshot={playerSnapshot}
          previewData={previewData}
          previewScale={previewScale}
          activeMap={activeMap}
          previewWidgetRef={previewWidgetRef}
          exportingImage={exportingImage}
          shareStatus={shareStatus}
          onPreviewScaleChange={onPreviewScaleChange}
          onBackdropPositionChange={onBackdropPositionChange}
          onDownload={onDownload}
          onShare={onShare}
        />

        <div className="mt-5 flex items-center justify-between border-b border-border/70 pb-2">
          <p className="text-label-sm text-tertiary">LAYOUTS ({WIDGET_PRESETS.length} presets)</p>
        </div>
        <LayoutGrid state={playerSnapshot} selectedPreset={config.preset} onPresetChange={onPresetChange} />
      </div>
    </section>
  )
}
