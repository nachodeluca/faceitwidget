"use client"

import { useEffect, useState, type ReactNode } from "react"

export type RotationItem = {
  id: string
  content: ReactNode
}

type RotationProps = {
  items: RotationItem[]
  enabled: boolean
  intervalMs: number
}

export function Rotation({ items, enabled, intervalMs }: RotationProps) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (!enabled || items.length < 2) {
      return
    }

    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % items.length)
    }, intervalMs)

    return () => window.clearInterval(timer)
  }, [enabled, intervalMs, items.length])

  if (items.length === 0) {
    return null
  }

  const activeItem = items[index % items.length]

  if (!enabled || items.length < 2) {
    return activeItem.content
  }

  return (
    <div
      className="-m-px overflow-hidden p-px"
      aria-live="polite"
      aria-atomic="true"
    >
      <div
        key={activeItem.id}
        className="motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-2 motion-safe:zoom-in-95 motion-safe:duration-200 motion-safe:ease-[var(--ease-out)]"
      >
        {activeItem.content}
      </div>
    </div>
  )
}
