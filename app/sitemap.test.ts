import { describe, expect, it } from "vitest"

import sitemap from "./sitemap"

describe("sitemap.xml", () => {
  it("contains only canonical URLs", () => {
    expect(sitemap()).toEqual([
      { url: "https://faceitwidget.com/" },
      { url: "https://faceitwidget.com/builder/" },
      { url: "https://faceitwidget.com/faceit-widget-obs/" },
      { url: "https://faceitwidget.com/faceit-widget-streamlabs/" },
      { url: "https://faceitwidget.com/live-faceit-stats/" },
      { url: "https://faceitwidget.com/presets/" },
      { url: "https://faceitwidget.com/presets/elo-pill/" },
      { url: "https://faceitwidget.com/presets/rank-elo/" },
      { url: "https://faceitwidget.com/presets/rank-country/" },
      { url: "https://faceitwidget.com/presets/compact/" },
      { url: "https://faceitwidget.com/presets/today-stats/" },
      { url: "https://faceitwidget.com/presets/rich-profile/" },
      { url: "https://faceitwidget.com/presets/profile-card/" },
      { url: "https://faceitwidget.com/presets/performance-card/" },
      { url: "https://faceitwidget.com/about/" },
      { url: "https://faceitwidget.com/contact/" },
      { url: "https://faceitwidget.com/privacy/" },
    ])
  })
})
