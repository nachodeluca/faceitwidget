import {
  WIDGET_BACKDROP_IDS,
  type WidgetBackdropAsset,
  type WidgetBackdropId,
} from "./types"

const BACKDROP_PATH = "/backgrounds"
type AmbientBackdropId = Exclude<WidgetBackdropId, "none">

const AMBIENT_BACKDROP_IDS = WIDGET_BACKDROP_IDS.filter(
  (id): id is AmbientBackdropId => id !== "none",
)

function createBackdrop(id: AmbientBackdropId): WidgetBackdropAsset {
  const number = id.replace("ambient-", "")
  const labelNumber = Number(number)

  return {
    id,
    label: `Ambient ${labelNumber}`,
    videoSrc: `${BACKDROP_PATH}/${id}.mp4`,
    posterSrc: `${BACKDROP_PATH}/${id}.webp`,
  }
}

export const WIDGET_BACKDROPS: readonly WidgetBackdropAsset[] = [
  {
    id: "none",
    label: "No background",
    videoSrc: null,
    posterSrc: null,
  },
  ...AMBIENT_BACKDROP_IDS.map(createBackdrop),
]

export function isWidgetBackdropId(value: unknown): value is WidgetBackdropId {
  return typeof value === "string" && WIDGET_BACKDROP_IDS.includes(value as WidgetBackdropId)
}

export function getWidgetBackdrop(id: WidgetBackdropId) {
  return WIDGET_BACKDROPS.find((backdrop) => backdrop.id === id) ?? WIDGET_BACKDROPS[0]
}
