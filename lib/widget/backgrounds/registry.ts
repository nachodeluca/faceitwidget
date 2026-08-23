import {
  WIDGET_BACKDROP_IDS,
  type WidgetBackdropAsset,
  type WidgetBackdropId,
  type WidgetBackdropMedia,
} from "./types"
import { createCustomBackdropAsset } from "./custom"
import { isCustomBackdropId } from "./custom-contract"

const BACKDROP_PATH = "/backgrounds"
type AmbientBackdropId = Exclude<(typeof WIDGET_BACKDROP_IDS)[number], "none">

const AMBIENT_BACKDROP_IDS = WIDGET_BACKDROP_IDS.filter(
  (id): id is AmbientBackdropId => id !== "none",
)

function createBackdrop(id: AmbientBackdropId): WidgetBackdropAsset {
  const number = id.replace("ambient-", "")
  const labelNumber = Number(number)

  return {
    id,
    label: `Ambient ${labelNumber}`,
    media: "video",
    src: `${BACKDROP_PATH}/${id}.mp4`,
    posterSrc: `${BACKDROP_PATH}/${id}.webp`,
  }
}

export const WIDGET_BACKDROPS: readonly WidgetBackdropAsset[] = [
  {
    id: "none",
    label: "No background",
    media: null,
    src: null,
    posterSrc: null,
  },
  ...AMBIENT_BACKDROP_IDS.map(createBackdrop),
]

export function isWidgetBackdropId(value: unknown): value is WidgetBackdropId {
  return (
    typeof value === "string" &&
    (WIDGET_BACKDROP_IDS.includes(value as (typeof WIDGET_BACKDROP_IDS)[number]) ||
      isCustomBackdropId(value))
  )
}

export function getWidgetBackdrop(id: WidgetBackdropId, media?: WidgetBackdropMedia) {
  const curated = WIDGET_BACKDROPS.find((backdrop) => backdrop.id === id)
  if (curated) return curated
  if (isCustomBackdropId(id)) return createCustomBackdropAsset(id, media ?? "image")
  return WIDGET_BACKDROPS[0]
}
