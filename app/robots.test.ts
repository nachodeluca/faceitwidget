import { describe, expect, it } from "vitest"

import robots from "./robots"

describe("robots.txt", () => {
  it("uses only directives supported by Google", () => {
    const config = robots()

    expect(Object.keys(config).sort()).toEqual(["rules", "sitemap"])
    expect(config.sitemap).toBe("https://faceitwidget.com/sitemap.xml")
  })
})
