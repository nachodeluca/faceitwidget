"use client"

import Image from "next/image"
import { Check, RotateCcw } from "lucide-react"

import {
  WIDGET_BACKDROPS,
  type WidgetBackdropAsset,
  type WidgetBackdropConfig,
  type WidgetBackdropPosition,
} from "@/lib/widget"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

type BackdropControlProps = {
  value: WidgetBackdropConfig
  onChange: (patch: Partial<WidgetBackdropConfig>) => void
}

const fieldLabelClass = "text-[12px] font-medium text-muted-foreground"
const sectionHeadingClass = "text-[10px] font-semibold uppercase tracking-[0.14em] text-foreground/80"

function BackdropCard({ backdrop, selected, onSelect }: {
  backdrop: WidgetBackdropAsset
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      aria-label={backdrop.label}
      aria-pressed={selected}
      className={cn(
        "group relative min-w-0 overflow-hidden rounded-lg border bg-surface/30 p-1 outline-none transition-[border-color,background-color,box-shadow,transform] duration-150 ease-[var(--ease-out)] hover:border-foreground/40 hover:bg-surface-2 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 active:scale-[0.98]",
        selected
          ? "border-foreground/80 bg-surface-2 shadow-[0_0_0_1px_rgb(255_255_255_/_20%)]"
          : "border-border/70",
      )}
      data-selected={selected}
      onClick={onSelect}
    >
      <span className="relative block aspect-square overflow-hidden rounded-md bg-surface-2">
        {backdrop.posterSrc ? (
          <Image
            src={backdrop.posterSrc}
            alt=""
            aria-hidden="true"
            fill
            sizes="96px"
            unoptimized
            className="object-cover transition-transform duration-300 ease-[var(--ease-out)] group-hover:scale-105"
          />
        ) : (
          <span className="absolute inset-0 grid place-items-center">
            <span className="size-5 rounded border border-dashed border-muted-foreground/65" />
          </span>
        )}
        <span
          aria-hidden="true"
          className={cn(
            "absolute right-1.5 top-1.5 flex size-5 items-center justify-center rounded-full bg-foreground text-background opacity-0 shadow-[0_2px_8px_rgb(0_0_0_/_35%)] transition-opacity duration-150",
            selected && "opacity-100",
          )}
        >
          <Check className="size-3" />
        </span>
      </span>
    </button>
  )
}

function BackdropPicker({ value, onChange }: BackdropControlProps) {
  return (
    <div aria-label="Video backdrop choices" className="grid grid-cols-3 gap-2" role="group">
      {WIDGET_BACKDROPS.map((backdrop) => (
        <BackdropCard
          key={backdrop.id}
          backdrop={backdrop}
          selected={value.id === backdrop.id}
          onSelect={() => onChange({ id: backdrop.id, position: { x: 50, y: 50 } })}
        />
      ))}
    </div>
  )
}

function PositionSlider({
  axis,
  value,
  onChange,
}: {
  axis: "x" | "y"
  value: number
  onChange: (value: number) => void
}) {
  const label = axis === "x" ? "Horizontal" : "Vertical"

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <Label className={fieldLabelClass}>{label}</Label>
        <span className="text-[11px] tabular-nums text-muted-foreground">{Math.round(value)}%</span>
      </div>
      <Slider
        min={0}
        max={100}
        step={1}
        value={[value]}
        onValueChange={(nextValue) => onChange(typeof nextValue === "number" ? nextValue : nextValue[0])}
        aria-label={`${label} background position`}
      />
    </div>
  )
}

function PositionControls({ value, onChange }: BackdropControlProps) {
  if (value.id === "none") return null

  const updatePosition = (patch: Partial<WidgetBackdropPosition>) => {
    onChange({ position: { ...value.position, ...patch } })
  }

  return (
    <div className="rounded-lg border border-border/70 bg-background/35 p-3">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-foreground">Position</p>
          <p className="mt-1 text-[11px] leading-4 text-muted-foreground">Drag the preview to reframe it.</p>
        </div>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                icon={<RotateCcw />}
                onClick={() => onChange({ position: { x: 50, y: 50 } })}
                aria-label="Center background"
              />
            }
          />
          <TooltipContent>Center background</TooltipContent>
        </Tooltip>
      </div>
      <div className="flex flex-col gap-4">
        <PositionSlider axis="x" value={value.position.x} onChange={(x) => updatePosition({ x })} />
        <PositionSlider axis="y" value={value.position.y} onChange={(y) => updatePosition({ y })} />
      </div>
    </div>
  )
}

export function BackdropControl({ value, onChange }: BackdropControlProps) {
  return (
    <div className="flex flex-col gap-3">
      <div>
        <p className={sectionHeadingClass}>Video backdrop</p>
        <p className="mt-1 text-[11px] leading-4 text-muted-foreground">A subtle motion layer behind the stats.</p>
      </div>
      <BackdropPicker value={value} onChange={onChange} />
      <PositionControls value={value} onChange={onChange} />
    </div>
  )
}
