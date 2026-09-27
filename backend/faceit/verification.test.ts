import { describe, expect, it } from "vitest"

import { verificationBadgeFromLevel } from "./verification"

describe("verificationBadgeFromLevel", () => {
  it("maps FACEIT white and gold levels to badge types", () => {
    expect(verificationBadgeFromLevel(2)).toBe("verified")
    expect(verificationBadgeFromLevel(3)).toBe("gold")
  })

  it("does not assign a badge for other or invalid levels", () => {
    expect(verificationBadgeFromLevel(0)).toBe("none")
    expect(verificationBadgeFromLevel(1)).toBe("none")
    expect(verificationBadgeFromLevel(4)).toBe("none")
    expect(verificationBadgeFromLevel(undefined)).toBe("none")
    expect(verificationBadgeFromLevel("3")).toBe("none")
  })
})
