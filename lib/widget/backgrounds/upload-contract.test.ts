import { describe, expect, it } from "vitest"

import { uploadMediaForType } from "./upload-contract"

describe("custom background upload contract", () => {
  it("accepts the supported image and video media types", () => {
    expect(uploadMediaForType("image/webp")).toBe("image")
    expect(uploadMediaForType("image/png")).toBe("image")
    expect(uploadMediaForType("video/mp4")).toBe("video")
  })

  it("rejects unsupported media types", () => {
    expect(uploadMediaForType("application/octet-stream")).toBeNull()
  })
})
