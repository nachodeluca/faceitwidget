import { describe, expect, it } from "vitest"

import { metadata } from "./page"

describe("builder search metadata", () => {
  it("keeps the canonical builder page indexable", () => {
    expect(metadata.alternates?.canonical).toBe("https://faceitwidget.com/builder/")
    expect(metadata.robots).toEqual({ index: true, follow: true })
    expect(metadata.openGraph?.url).toBe("https://faceitwidget.com/builder/")
  })

  it("has a dedicated title and description for the builder", () => {
    expect(metadata.title).toBe("Free CS2 Overlay Builder for OBS & Streamlabs")
    expect(typeof metadata.description).toBe("string")
    expect(metadata.description).toMatch(/FACEIT/)
    expect(metadata.description).toMatch(/OBS/)
    expect(metadata.description).toMatch(/Streamlabs/)
    expect((metadata.description as string).length).toBeLessThanOrEqual(160)
  })
})
