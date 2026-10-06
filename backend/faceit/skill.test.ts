import { describe, expect, it } from "vitest"

import { faceitSkillsSchema } from "./schemas"
import { normalizeSkill } from "./skill"

const game = { skill_level: 0, faceit_elo: 0 }

function skill(calibrating: Record<string, unknown>, extra = {}) {
  return faceitSkillsSchema.parse({
    payload: [{ user_id: "player-1", calibrating, ...extra }],
  }).payload[0]
}

describe("normalizeSkill", () => {
  it.each([0, 1, 4, 10])("calculates progress with %s matches remaining", (remaining) => {
    expect(
      normalizeSkill(game, skill({ active: true, target: 10, matches_remaining: remaining })),
    ).toEqual({
      status: "unranked",
      level: 0,
      elo: 0,
      placements: { played: 10 - remaining, total: 10 },
    })
  })

  it("accepts the camelCase response captured in FACEIT's HAR", () => {
    const response = faceitSkillsSchema.parse({
      payload: [
        {
          userId: "player-1",
          calibrating: { active: true, target: 10, matchesRemaining: 4 },
        },
      ],
    })
    expect(response.payload[0].playerId).toBe("player-1")
    expect(normalizeSkill(game, response.payload[0]).placements).toEqual({ played: 6, total: 10 })
  })

  it.each([
    { target: 0, matches_remaining: 0 },
    { target: 10, matches_remaining: 11 },
    { target: 10, matches_remaining: -1 },
    { target: 10, matches_remaining: 4.5 },
    { target: 10 },
    { target: "10", matches_remaining: 4 },
  ])("keeps Unranked without fabricating invalid progress: %j", (counter) => {
    expect(normalizeSkill(game, skill({ active: true, ...counter }))).toEqual({
      status: "unranked",
      level: 0,
      elo: 0,
      placements: undefined,
    })
  })

  it("uses FACEIT's target rather than assuming ten matches", () => {
    expect(
      normalizeSkill(game, skill({ active: true, target: 5, matches_remaining: 2 })).placements,
    ).toEqual({ played: 3, total: 5 })
  })

  it("keeps a complete calibration Unranked until FACEIT publishes the rank", () => {
    const ranked = { level: 10, value: 2_327 }
    expect(
      normalizeSkill(
        { skill_level: 10, faceit_elo: 2_327 },
        skill({ active: true, target: 10, matches_remaining: 0 }, { game_skill: ranked }),
      ).status,
    ).toBe("unranked")
    expect(normalizeSkill(game, skill({ active: false }, { game_skill: ranked }))).toEqual({
      status: "ranked",
      level: 10,
      elo: 2_327,
    })
  })

  it("restores the published camelCase rank even when the Data API still reports zero", () => {
    const response = faceitSkillsSchema.parse({
      payload: [{ userId: "player-1", gameSkill: { level: 4, value: 1_000 } }],
    })
    expect(normalizeSkill(game, response.payload[0])).toEqual({
      status: "ranked",
      level: 4,
      elo: 1_000,
    })
  })

  it("falls back to the Data API when skill data is unavailable", () => {
    expect(normalizeSkill(game, undefined)).toEqual({ status: "unranked", level: 0, elo: 0 })
    expect(normalizeSkill({ skill_level: 1, faceit_elo: 100 }, undefined)).toEqual({
      status: "ranked",
      level: 1,
      elo: 100,
    })
  })
})
