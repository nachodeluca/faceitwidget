"use client"

import { preload } from "react-dom"

import { WIDGET_BACKDROPS } from "@/lib/widget"

export function BackdropPosterPreloads() {
  WIDGET_BACKDROPS.forEach(({ posterSrc }) => {
    if (posterSrc) preload(posterSrc, { as: "image" })
  })

  return null
}
