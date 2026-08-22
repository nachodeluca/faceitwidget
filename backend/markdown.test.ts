import { describe, expect, it } from "vitest"

import {
  getMarkdownDocument,
  NOT_FOUND_MARKDOWN,
  prefersMarkdown,
  serveAgentDocument,
  serveNotFound,
  withDocumentVary,
} from "./markdown"

const assets = {
  fetch: async () => new Response("<html>page</html>", {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  }),
}

describe("markdown negotiation", () => {
  it.each([
    ["text/markdown", true],
    ["text/markdown, text/html;q=0.8", true],
    ["text/html, text/markdown;q=0.8", false],
    ["text/html", false],
    ["*/*", false],
    [null, false],
  ])("resolves %s as markdown=%s", (accept, expected) => {
    expect(prefersMarkdown(accept)).toBe(expected)
  })

  it("serves Markdown for a known public document", async () => {
    const response = await serveAgentDocument(
      new Request("https://faceitwidget.com/faceit-widget-obs/", {
        headers: { Accept: "text/markdown" },
      }),
      assets,
    )

    expect(response?.headers.get("Content-Type")).toBe("text/markdown; charset=utf-8")
    expect(response?.headers.get("Vary")).toBe("Accept, Accept-Encoding")
    expect(response?.headers.get("Cache-Control")).toBeNull()
    expect(await response?.text()).toContain("# How to add a FACEIT widget to OBS")
  })

  it("keeps HTML for a browser preference and varies it by Accept", async () => {
    const response = await serveAgentDocument(
      new Request("https://faceitwidget.com/", {
        headers: { Accept: "text/html, text/markdown;q=0.5" },
      }),
      assets,
    )

    expect(response?.headers.get("Content-Type")).toBe("text/html; charset=utf-8")
    expect(response?.headers.get("Vary")).toBe("Accept, Accept-Encoding")
    expect(await response?.text()).toBe("<html>page</html>")
  })

  it("adds the cache variation to an existing response", () => {
    const response = withDocumentVary(new Response("ok", { headers: { Vary: "Origin" } }))

    expect(response.headers.get("Vary")).toBe("Accept, Accept-Encoding")
  })

  it("returns the agent document for the not-found response", async () => {
    const response = serveNotFound(
      new Request("https://faceitwidget.com/missing", { headers: { Accept: "text/markdown" } }),
      new Response("not found", { status: 404 }),
    )

    expect(response.status).toBe(404)
    expect(response.headers.get("Content-Type")).toBe("text/markdown; charset=utf-8")
    expect(await response.text()).toBe(NOT_FOUND_MARKDOWN)
  })

  it("keeps the public documents non-empty", () => {
    expect(getMarkdownDocument("/")).toContain("FACEIT Widget")
    expect(getMarkdownDocument("/contact/")?.length).toBeGreaterThan(500)
    expect(getMarkdownDocument("/privacy/")?.length).toBeGreaterThan(500)
  })
})
