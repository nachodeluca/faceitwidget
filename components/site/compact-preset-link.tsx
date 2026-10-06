"use client"

import Link from "next/link"
import { type FocusEvent, type PointerEvent, useEffect, useRef, useState } from "react"

import { Widget } from "@/components/widget/widget"
import { APP_PATHS } from "@/lib/site-metadata"
import { createDefaultConfig, type WidgetData } from "@/lib/widget"

const previewData: WidgetData = {
  profile: {
    nickname: "donk666",
    countryCode: "ru",
    regionCode: "EU",
  },
  rank: {
    level: 10,
    elo: 5_053,
    regionRank: 1,
    countryRank: 1,
    isChallenger: true,
  },
  last30: {
    avgKills: 25,
    adr: 115,
    avgKD: 1.86,
    avgKR: 1.2,
  },
  last5Results: ["loss", "win", "loss", "win", "win"],
}

const previewConfig = createDefaultConfig("compact")

function getCloseDuration() {
  const duration = Number.parseFloat(
    window.getComputedStyle(document.documentElement).getPropertyValue("--dropdown-close-dur"),
  )

  return Number.isFinite(duration) ? duration : 150
}

export function CompactPresetLink() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(
    () => () => {
      if (closeTimer.current) clearTimeout(closeTimer.current)
    },
    [],
  )

  function openDropdown() {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setIsClosing(false)
    setIsMounted(true)
    setIsOpen(true)
  }

  function closeDropdown() {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setIsOpen(false)
    setIsClosing(true)
    closeTimer.current = setTimeout(() => setIsClosing(false), getCloseDuration())
  }

  function handlePointerLeave(event: PointerEvent<HTMLDivElement>) {
    if (!event.currentTarget.contains(document.activeElement)) closeDropdown()
  }

  function handleBlur(event: FocusEvent<HTMLDivElement>) {
    const nextTarget = event.relatedTarget
    const focusRemainsInside =
      nextTarget instanceof Node && event.currentTarget.contains(nextTarget)

    if (!focusRemainsInside && !event.currentTarget.matches(":hover")) closeDropdown()
  }

  const dropdownClassName = ["t-dropdown", isOpen ? "is-open" : "", isClosing ? "is-closing" : ""]
    .filter(Boolean)
    .join(" ")

  return (
    <div
      className="relative inline-flex align-baseline"
      onPointerEnter={openDropdown}
      onPointerLeave={handlePointerLeave}
      onFocusCapture={openDropdown}
      onBlurCapture={handleBlur}
    >
      <Link
        href={{ pathname: APP_PATHS.builder, query: { preset: "compact" } }}
        aria-controls="compact-preset-preview"
        aria-expanded={isOpen}
        className="rounded-sm font-semibold text-secondary-foreground underline decoration-white/25 underline-offset-4 transition-[color,text-decoration-color] duration-150 hover:decoration-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
      >
        Compact
      </Link>
      <div className="absolute left-1/2 top-full z-50 w-[min(92vw,29rem)] -translate-x-1/2 pt-2 text-left">
        <div
          id="compact-preset-preview"
          className={dropdownClassName}
          data-origin="top-center"
          role="region"
          aria-label="Compact preset preview"
          aria-hidden={!isOpen}
        >
          <div className="overflow-hidden rounded-xl border border-border/80 bg-background p-2 shadow-[0_16px_40px_rgb(0_0_0_/_45%)]">
            {isMounted ? (
              <div className="flex justify-center">
                <Widget data={previewData} config={previewConfig} shadow="none" />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
