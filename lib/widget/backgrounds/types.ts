export const WIDGET_BACKDROP_IDS = [
  "none",
  "ambient-01",
  "ambient-02",
  "ambient-03",
  "ambient-04",
  "ambient-05",
  "ambient-06",
  "ambient-07",
  "ambient-08",
  "ambient-09",
  "ambient-10",
  "ambient-11",
  "ambient-12",
] as const

export type WidgetBackdropId = (typeof WIDGET_BACKDROP_IDS)[number]

export type WidgetBackdropPosition = {
  x: number
  y: number
}

export type WidgetBackdropConfig = {
  id: WidgetBackdropId
  position: WidgetBackdropPosition
}

export type WidgetBackdropAsset = {
  id: WidgetBackdropId
  label: string
  videoSrc: string | null
  posterSrc: string | null
}
