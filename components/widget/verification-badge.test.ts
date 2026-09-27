import { createElement, Fragment } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { GoldVerificationBadge, VerificationBadge, WhiteVerificationBadge } from "./verification-badge"

describe("FACEIT verification badges", () => {
  it("renders the white mark as an accessible image", () => {
    const markup = renderToStaticMarkup(createElement(WhiteVerificationBadge))

    expect(markup).toContain('role="img"')
    expect(markup).toContain('aria-label="FACEIT verified badge"')
    expect(markup).toContain('fill="currentColor"')
  })

  it("renders the gold gradient with unique SVG definition IDs", () => {
    const markup = renderToStaticMarkup(createElement(Fragment, null,
      createElement(GoldVerificationBadge),
      createElement(GoldVerificationBadge),
    ))
    const ids = Array.from(markup.matchAll(/\sid="([^"]+)"/g), (match) => match[1])

    expect(markup).toContain('aria-label="FACEIT gold verification badge"')
    expect(markup).toContain("#ffffb4")
    expect(new Set(ids).size).toBe(ids.length)
  })

  it("selects the proper icon variant", () => {
    const whiteMarkup = renderToStaticMarkup(createElement(VerificationBadge, { type: "verified" }))
    const goldMarkup = renderToStaticMarkup(createElement(VerificationBadge, { type: "gold" }))

    expect(whiteMarkup).toContain('aria-label="FACEIT verified badge"')
    expect(goldMarkup).toContain('aria-label="FACEIT gold verification badge"')
  })
})
