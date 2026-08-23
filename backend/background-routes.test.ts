import { describe, expect, it } from "vitest"

import { backgroundRequest, isBackgroundRoute } from "./background-routes"

describe("custom background routes", () => {
  it("only matches the intent and completion endpoints", () => {
    expect(isBackgroundRoute("/api/v1/backgrounds/intents")).toBe(true)
    expect(isBackgroundRoute("/api/v1/backgrounds/complete")).toBe(true)
    expect(isBackgroundRoute("/api/v1/backgrounds/source")).toBe(false)
  })

  it("answers preflight requests for allowed origins", async () => {
    const response = await backgroundRequest(
      new Request("https://faceitwidget.com/api/v1/backgrounds/intents", {
        method: "OPTIONS",
        headers: { Origin: "https://faceitwidget.com" },
      }),
      {} as never,
    )

    expect(response.status).toBe(204)
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe("https://faceitwidget.com")
  })
})
