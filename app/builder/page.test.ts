import { describe, expect, it } from "vitest"

import { metadata } from "./page"

describe("builder search metadata", () => {
  it("keeps the canonical builder page indexable", () => {
    expect(metadata.alternates?.canonical).toBe("https://faceitwidget.com/builder/")
    expect(metadata.robots).toEqual({ index: true, follow: true })
    expect(metadata.openGraph?.url).toBe("https://faceitwidget.com/builder/")
  })
})
