import type { VerifiedBadgeType } from "../../lib/widget/types"

export function verificationBadgeFromLevel(level: unknown): VerifiedBadgeType {
  if (level === 2) return "verified"
  if (level === 3) return "gold"
  return "none"
}
