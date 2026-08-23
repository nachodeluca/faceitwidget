import { describe, expect, it } from "vitest"

import { canonicalPageRedirect, staticRscAssetRequest } from "./page-routing"

describe("canonical page routing", () => {
  it.each([
    "/builder",
    "/widget",
    "/faceit-widget-obs",
    "/live-faceit-stats",
    "/contact",
    "/privacy",
  ])("permanently redirects %s to its trailing-slash URL", (pathname) => {
    const response = canonicalPageRedirect(
      new Request(`https://faceitwidget.com${pathname}?source=test`),
    )

    expect(response?.status).toBe(301)
    expect(response?.headers.get("location")).toBe(
      `https://faceitwidget.com${pathname}/?source=test`,
    )
  })

  it.each([
    ["/guides/faceit-widget-obs", "/faceit-widget-obs/"],
    ["/guides/faceit-widget-obs/", "/faceit-widget-obs/"],
    ["/guides/live-faceit-stats", "/live-faceit-stats/"],
    ["/guides/live-faceit-stats/", "/live-faceit-stats/"],
  ])("moves the legacy guide %s to %s", (source, target) => {
    const response = canonicalPageRedirect(
      new Request(`https://faceitwidget.com${source}?source=test`),
    )

    expect(response?.status).toBe(301)
    expect(response?.headers.get("location")).toBe(
      `https://faceitwidget.com${target}?source=test`,
    )
  })

  it.each(["/", "/builder/", "/api/v1/shares", "/logo.svg", "/unknown"])(
    "leaves %s untouched",
    (pathname) => {
      expect(canonicalPageRedirect(new Request(`https://faceitwidget.com${pathname}`))).toBeNull()
    },
  )
})

describe("static RSC asset routing", () => {
  it.each([
    ["/builder/__next.builder.__PAGE__.txt", "/builder/__next.builder/__PAGE__.txt"],
    [
      "/live-faceit-stats/__next.live-faceit-stats.__PAGE__.txt",
      "/live-faceit-stats/__next.live-faceit-stats/__PAGE__.txt",
    ],
  ])("maps %s to the exported asset at %s", (source, target) => {
    const rewritten = staticRscAssetRequest(
      new Request(`https://faceitwidget.com${source}?dpl=test`),
    )

    expect(rewritten && new URL(rewritten.url).pathname).toBe(target)
    expect(rewritten && new URL(rewritten.url).search).toBe("?dpl=test")
  })

  it.each(["/", "/builder/", "/builder/index.txt", "/api/v1/shares"])(
    "leaves %s untouched",
    (pathname) => {
      expect(staticRscAssetRequest(new Request(`https://faceitwidget.com${pathname}`))).toBeNull()
    },
  )
})
