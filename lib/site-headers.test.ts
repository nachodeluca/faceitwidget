import { readFileSync } from "node:fs"
import { resolve } from "node:path"

import { describe, expect, it } from "vitest"

describe("public response headers", () => {
  it("serves the Open Graph image as PNG", () => {
    const headers = readFileSync(resolve(process.cwd(), "public", "_headers"), "utf8")

    expect(headers).toContain("/opengraph-image*")
    expect(headers).toContain("Content-Type: image/png")
  })
})
