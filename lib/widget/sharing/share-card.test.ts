import { afterEach, describe, expect, it, vi } from "vitest"

import { createWidgetShare, xShareIntent } from "./share-card"

afterEach(() => {
  vi.unstubAllGlobals()
})

describe("widget sharing", () => {
  it("publishes the PNG and returns the short share URL", async () => {
    const fetcher = vi.fn(async () => Response.json({
      shareUrl: "https://faceitwidget.com/s/abc123def456/",
    }, { status: 201 }))
    vi.stubGlobal("fetch", fetcher)
    const image = new Blob(["png"], { type: "image/png" })

    await expect(createWidgetShare(image, {
      nickname: "donk666",
      preset: "rich-profile",
    })).resolves.toBe("https://faceitwidget.com/s/abc123def456/")

    expect(fetcher).toHaveBeenCalledWith("/api/v1/shares", expect.objectContaining({
      method: "POST",
      body: image,
    }))
  })

  it("shares only the short card URL with X", () => {
    const intent = new URL(xShareIntent("https://faceitwidget.com/s/abc123def456/"))

    expect(intent.origin + intent.pathname).toBe("https://x.com/intent/post")
    expect(intent.searchParams.get("url")).toBe("https://faceitwidget.com/s/abc123def456/")
    expect(intent.toString()).not.toContain("config%3D")
  })
})
