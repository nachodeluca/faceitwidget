import { z } from "zod"

const statRecordSchema = z.record(z.string(), z.unknown())

const gameSchema = z.object({
  faceit_elo: z.number().optional(),
  region: z.string().optional(),
  skill_level: z.number().optional(),
}).passthrough()

export const faceitPlayerSchema = z.object({
  player_id: z.string().min(1),
  nickname: z.string().min(1),
  avatar: z.string().optional(),
  country: z.string().optional(),
  games: z.record(z.string(), gameSchema).default({}),
}).passthrough()

export const faceitLifetimeSchema = z.object({
  lifetime: statRecordSchema.default({}),
}).passthrough()

export const faceitMatchStatsSchema = z.object({
  items: z.array(z.object({ stats: statRecordSchema.default({}) }).passthrough()).default([]),
}).passthrough()

export const faceitHistorySchema = z.object({
  items: z.array(z.object({
    match_id: z.string(),
    finished_at: z.number().optional(),
    status: z.string().optional(),
  }).passthrough()).default([]),
}).passthrough()

export const faceitRankingSchema = z.object({
  position: z.number().optional(),
}).passthrough()

export type FaceitPlayer = z.infer<typeof faceitPlayerSchema>
export type FaceitLifetime = z.infer<typeof faceitLifetimeSchema>
export type FaceitMatchStats = z.infer<typeof faceitMatchStatsSchema>
export type FaceitHistory = z.infer<typeof faceitHistorySchema>
export type FaceitRanking = z.infer<typeof faceitRankingSchema>
