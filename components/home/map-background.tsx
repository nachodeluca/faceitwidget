"use client"

import Image from "next/image"
import { useEffect, useState } from "react"

import { WIDGET_MAPS } from "@/lib/widget/maps"
import { cn } from "@/lib/utils"

const mapSources = WIDGET_MAPS.flatMap((map) => (map.src ? [{ id: map.id, src: map.src }] : []))

type MapBackgroundProps = {
  className?: string
}

export function MapBackground({ className }: MapBackgroundProps) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % mapSources.length)
    }, 5000)

    return () => window.clearInterval(timer)
  }, [])

  const activeMap = mapSources[index]

  if (!activeMap) {
    return null
  }

  return (
    <div className={cn("pointer-events-none absolute overflow-hidden", className)} aria-hidden="true">
      <Image
        key={activeMap.id}
        src={activeMap.src}
        alt=""
        fill
        fetchPriority={index === 0 ? "high" : "auto"}
        loading={index === 0 ? "eager" : "lazy"}
        sizes="(min-width: 1024px) 50vw, 100vw"
        className="object-cover object-center [filter:saturate(.4)_brightness(.48)] motion-safe:animate-in motion-safe:fade-in-0 motion-safe:duration-500 motion-safe:ease-[var(--ease-out)]"
      />
    </div>
  )
}
