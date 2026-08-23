import type { CustomWidgetBackdropId } from "./types"

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const LEGACY_ID_PATTERN = /^custom-[a-z0-9-]{20,80}$/i

export function isCustomBackdropId(value: unknown): value is CustomWidgetBackdropId {
  return typeof value === "string" && (UUID_PATTERN.test(value) || LEGACY_ID_PATTERN.test(value))
}
