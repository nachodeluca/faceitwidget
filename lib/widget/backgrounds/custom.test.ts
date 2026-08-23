import { describe, expect, it } from "vitest"

import {
  addCustomBackdrop,
  createCustomBackdropAsset,
  readCustomBackdrops,
} from "./custom"
import type { CustomWidgetBackdropId } from "./types"

function storage() {
  const values = new Map<string, string>()
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
  }
}

function record(index: number) {
  const id = `00000000-0000-4000-8000-${String(index + 1).padStart(12, "0")}` as CustomWidgetBackdropId
  return {
    id,
    media: "image" as const,
    sourceUrl: `https://assets.faceitwidget.com/custom/${id}/source`,
    createdAt: new Date(2026, 0, index + 1).toISOString(),
  }
}

describe("custom background catalog", () => {
  it("persists only the latest ten local backgrounds", () => {
    const target = storage()
    for (let index = 0; index < 12; index += 1) addCustomBackdrop(record(index), target)

    expect(readCustomBackdrops(target).map(({ id }) => id)).toEqual(
      Array.from({ length: 10 }, (_, index) => record(index + 2).id),
    )
  })

  it("builds a standalone video asset from its compact identity", () => {
    const id = "00000000-0000-4000-8000-000000000001" as CustomWidgetBackdropId
    const asset = createCustomBackdropAsset(id, "video")

    expect(asset).toMatchObject({
      media: "video",
      src: "https://assets.faceitwidget.com/custom/00000000-0000-4000-8000-000000000001/source",
      posterSrc: "https://assets.faceitwidget.com/custom/00000000-0000-4000-8000-000000000001/poster.webp",
    })
  })

  it("removes redundant image poster URLs from local storage", () => {
    const target = storage()
    const image = record(0)
    target.setItem(
      "faceitwidget.custom-backgrounds.v1",
      JSON.stringify([{ ...image, posterUrl: image.sourceUrl }]),
    )

    expect(readCustomBackdrops(target)[0]).not.toHaveProperty("posterUrl")
  })
})
