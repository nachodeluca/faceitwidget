"use client"

import { useEffect, useRef, useState } from "react"

import { formatNumber } from "@/lib/format"

type AnimatedNumberProps = {
  value?: number
  maximumFractionDigits?: number
  duration?: number
}

export function AnimatedNumber({
  value,
  maximumFractionDigits = 0,
  duration = 360,
}: AnimatedNumberProps) {
  const target = typeof value === "number" && Number.isFinite(value) ? value : undefined
  const [displayValue, setDisplayValue] = useState(0)
  const displayValueRef = useRef(0)
  const frameRef = useRef<number | null>(null)
  const [reduceMotion, setReduceMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    const updatePreference = () => setReduceMotion(mediaQuery.matches)

    updatePreference()
    mediaQuery.addEventListener("change", updatePreference)

    return () => mediaQuery.removeEventListener("change", updatePreference)
  }, [])

  useEffect(() => {
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current)
    }

    if (target === undefined) {
      displayValueRef.current = 0
      return
    }

    if (reduceMotion || displayValueRef.current === target) {
      displayValueRef.current = target
      return
    }

    const startValue = displayValueRef.current
    const distance = target - startValue
    const startedAt = performance.now()

    const animate = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / duration)
      const easedProgress = 1 - (1 - progress) ** 3
      const nextValue = startValue + distance * easedProgress

      displayValueRef.current = nextValue
      setDisplayValue(nextValue)

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate)
      } else {
        frameRef.current = null
        displayValueRef.current = target
        setDisplayValue(target)
      }
    }

    frameRef.current = requestAnimationFrame(animate)

    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current)
        frameRef.current = null
      }
    }
  }, [duration, reduceMotion, target])

  const renderedValue = reduceMotion && target !== undefined ? target : displayValue

  return <>{formatNumber(target === undefined ? undefined : renderedValue, maximumFractionDigits)}</>
}
