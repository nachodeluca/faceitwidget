import type { WidgetData } from "../../lib/widget/types"
import type { FaceitPlayer, FaceitSkill } from "./schemas"

export function normalizeSkill(
  game: FaceitPlayer["games"][string],
  skill: FaceitSkill | undefined,
): WidgetData["rank"] {
  const calibration = skill?.calibrating
  if (calibration?.active) {
    const total = calibration.target
    const remaining = calibration.matchesRemaining
    const placements =
      total !== undefined && remaining !== undefined && remaining <= total
        ? { played: total - remaining, total }
        : undefined

    return { status: "unranked", level: 0, elo: 0, placements }
  }

  if (skill?.gameSkill) {
    return { status: "ranked", level: skill.gameSkill.level, elo: skill.gameSkill.value }
  }

  const level = game.skill_level ?? 0
  const elo = game.faceit_elo ?? 0
  return { status: level === 0 && elo === 0 ? "unranked" : "ranked", level, elo }
}
