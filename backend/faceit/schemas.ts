import { z } from "zod"

const statRecordSchema = z.record(z.string(), z.unknown())

const gameSchema = z
  .object({
    faceit_elo: z.number().optional(),
    region: z.string().optional(),
    skill_level: z.number().optional(),
  })
  .passthrough()

export const faceitPlayerSchema = z
  .object({
    player_id: z.string().min(1),
    nickname: z.string().min(1),
    avatar: z.string().optional(),
    country: z.string().optional(),
    games: z.record(z.string(), gameSchema).default({}),
  })
  .passthrough()

export const faceitLifetimeSchema = z
  .object({
    lifetime: statRecordSchema.default({}),
  })
  .passthrough()

export const faceitMatchStatsSchema = z
  .object({
    items: z.array(z.object({ stats: statRecordSchema.default({}) }).passthrough()).default([]),
  })
  .passthrough()

export const faceitHistorySchema = z
  .object({
    items: z
      .array(
        z
          .object({
            match_id: z.string(),
            finished_at: z.number().optional(),
            status: z.string().optional(),
          })
          .passthrough(),
      )
      .default([]),
  })
  .passthrough()

export const faceitRankingSchema = z
  .object({
    position: z.number().optional(),
  })
  .passthrough()

export const faceitVerificationLevelSchema = z
  .object({
    result: z.literal("OK"),
    payload: z
      .object({
        current: z.number(),
      })
      .passthrough(),
  })
  .passthrough()

const gameSkillSchema = z.object({
  value: z.number().int().positive(),
  level: z.number().int().min(1).max(10),
})

export const faceitSkillsSchema = z.object({
  payload: z.array(
    z
      .object({
        user_id: z.string().optional(),
        userId: z.string().optional(),
        game_skill: gameSkillSchema.optional().catch(undefined),
        gameSkill: gameSkillSchema.optional().catch(undefined),
        calibrating: z
          .object({
            active: z.boolean(),
            target: z.number().int().positive().optional().catch(undefined),
            matches_remaining: z.number().int().nonnegative().optional().catch(undefined),
            matchesRemaining: z.number().int().nonnegative().optional().catch(undefined),
          })
          .optional(),
      })
      .transform((skill) => ({
        playerId: skill.user_id ?? skill.userId,
        gameSkill: skill.game_skill ?? skill.gameSkill,
        calibrating: skill.calibrating
          ? {
              active: skill.calibrating.active,
              target: skill.calibrating.target,
              matchesRemaining:
                skill.calibrating.matches_remaining ?? skill.calibrating.matchesRemaining,
            }
          : undefined,
      })),
  ),
})

export type FaceitPlayer = z.infer<typeof faceitPlayerSchema>
export type FaceitLifetime = z.infer<typeof faceitLifetimeSchema>
export type FaceitMatchStats = z.infer<typeof faceitMatchStatsSchema>
export type FaceitHistory = z.infer<typeof faceitHistorySchema>
export type FaceitRanking = z.infer<typeof faceitRankingSchema>
export type FaceitVerificationLevel = z.infer<typeof faceitVerificationLevelSchema>
export type FaceitSkill = z.infer<typeof faceitSkillsSchema>["payload"][number]
