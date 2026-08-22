import { describe, expect, it } from "vitest"

import sitemap from "./sitemap"

describe("sitemap.xml", () => {
  it("contains only canonical URLs", () => {
    expect(sitemap()).toEqual([
      { url: "https://faceitwidget.com/" },
      { url: "https://faceitwidget.com/faceit-widget-obs/" },
      { url: "https://faceitwidget.com/live-faceit-stats/" },
      { url: "https://faceitwidget.com/contact/" },
      { url: "https://faceitwidget.com/privacy/" },
    ])
  })
})
