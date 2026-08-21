"use client"

import { preload } from "react-dom"

import { WIDGET_MAPS } from "@/lib/widget"

export function MapIconPreloads() {
  WIDGET_MAPS.forEach(({ iconSrc }) => {
    if (iconSrc) preload(iconSrc, { as: "image" })
  })

  return null
}
