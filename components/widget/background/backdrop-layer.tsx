"use client"

import Image from "next/image"
import { useState, type PointerEvent } from "react"

import {
  getWidgetBackdrop,
  type WidgetBackdropConfig,
  type WidgetBackdropId,
  type WidgetBackdropPosition,
} from "@/lib/widget"
import { cn } from "@/lib/utils"

type BackdropLayerProps = {
  config: WidgetBackdropConfig
  interaction?: {
    onPositionChange: (position: WidgetBackdropPosition) => void
  }
}

function pointerPosition(event: PointerEvent<HTMLDivElement>): WidgetBackdropPosition {
  const rect = event.currentTarget.getBoundingClientRect()
  const x = ((event.clientX - rect.left) / rect.width) * 100
  const y = ((event.clientY - rect.top) / rect.height) * 100

  return {
    x: Math.min(100, Math.max(0, Number(x.toFixed(1)))),
    y: Math.min(100, Math.max(0, Number(y.toFixed(1)))),
  }
}

export function BackdropLayer({ config, interaction }: BackdropLayerProps) {
  const backdrop = getWidgetBackdrop(config.id)
  const [dragging, setDragging] = useState(false)
  const [readyBackdropId, setReadyBackdropId] = useState<WidgetBackdropId | null>(null)

  if (!backdrop.videoSrc || !backdrop.posterSrc) return null

  const draggable = Boolean(interaction)
  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!interaction || event.button !== 0) return
    event.currentTarget.setPointerCapture(event.pointerId)
    setDragging(true)
    interaction.onPositionChange(pointerPosition(event))
  }
  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!interaction || !dragging) return
    interaction.onPositionChange(pointerPosition(event))
  }
  const stopDragging = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragging) return
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    setDragging(false)
  }

  return (
    <div
      aria-label={draggable ? "Drag to reposition the widget background" : undefined}
      className={cn(
        "absolute inset-0 z-0 overflow-hidden rounded-[inherit]",
        draggable ? "touch-none cursor-grab" : "pointer-events-none",
        dragging && "cursor-grabbing",
      )}
      data-backdrop-id={config.id}
      data-dragging={dragging}
      onPointerCancel={stopDragging}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={stopDragging}
    >
      <Image
        src={backdrop.posterSrc}
        alt=""
        aria-hidden="true"
        fill
        sizes="100vw"
        unoptimized
        className="object-cover"
        style={{ objectPosition: `${config.position.x}% ${config.position.y}%` }}
      />
      <video
        key={config.id}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster={backdrop.posterSrc}
        aria-hidden="true"
        className={cn(
          "absolute inset-0 size-full object-cover",
          readyBackdropId === config.id ? "opacity-100" : "opacity-0",
        )}
        style={{ objectPosition: `${config.position.x}% ${config.position.y}%` }}
        onCanPlay={() => setReadyBackdropId(config.id)}
        onError={() => setReadyBackdropId(null)}
      >
        <source src={backdrop.videoSrc} type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(0_0_0_/_34%),rgb(0_0_0_/_68%))]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgb(0_0_0_/_22%)_100%)]" />
    </div>
  )
}
