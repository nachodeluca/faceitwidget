import { isRecord } from "../../utils"
import { getRotationFields, supportsWidgetRotation, WIDGET_PRESET_MAP } from "./presets"
import {
  isWidgetPresetId,
  type WidgetBackground,
  type WidgetConfig,
  type WidgetDensity,
  type WidgetFontId,
  type WidgetRotation,
  type WidgetRotationField,
  type WidgetStyle,
  type WidgetVisibility,
  type WidgetVisibilityKey,
} from "../types"

const DEFAULT_COLORS = {
  accent: "#3a3a3a",
  text: "#f1f1f1",
  mutedText: "#a3a3a3",
  surface: "#181818",
  surfaceMuted: "#242424",
  borderEnabled: false,
  border: "#303030",
}

export const CHALLENGER_RANK_COLORS = {
  gold: "#FFD335",
  silver: "#DEF5FF",
  bronze: "#FF7236",
  top: "#E80129",
} as const

export const DEFAULT_WIDGET_CONFIG: WidgetConfig = {
  version: 1,
  preset: "elo-pill",
  visibility: { ...WIDGET_PRESET_MAP["elo-pill"].defaultVisibility },
  style: {
    font: "outfit",
    scale: 1,
    density: "compact",
    background: "solid",
    ...DEFAULT_COLORS,
    radius: 8,
    opacity: 1,
  },
  rotation: {
    enabled: false,
    intervalMs: 4000,
    fields: ["today", "last30"],
  },
}

const FONT_IDS = ["outfit", "system", "mono"] as const satisfies readonly WidgetFontId[]
const DENSITY_IDS = ["comfortable", "compact"] as const satisfies readonly WidgetDensity[]
const BACKGROUND_IDS = ["solid", "none"] as const satisfies readonly WidgetBackground[]
const ROTATION_FIELDS = [
  "rank",
  "today",
  "last30",
  "lifetime",
] as const satisfies readonly WidgetRotationField[]
const VISIBILITY_KEYS = [
  "nickname",
  "avatar",
  "level",
  "elo",
  "worldRank",
  "regionRank",
  "countryRank",
  "challenger",
  "challengerRank",
  "kdr",
  "todayStats",
  "last30Stats",
  "last5Results",
] as const satisfies readonly (keyof WidgetVisibility)[]
const ROTATION_VISIBILITY_FIELDS: Partial<Record<WidgetVisibilityKey, WidgetRotationField>> = {
  todayStats: "today",
  last30Stats: "last30",
  kdr: "lifetime",
}
const COLOR_PATTERN = /^#[0-9a-f]{3,8}$/i

function clamp(value: unknown, min: number, max: number, fallback: number) {
  const number = typeof value === "number" && Number.isFinite(value) ? value : fallback
  return Math.min(max, Math.max(min, number))
}

function safeColor(value: unknown, fallback: string) {
  return typeof value === "string" && COLOR_PATTERN.test(value) ? value : fallback
}

function safeBoolean(value: unknown, fallback: boolean) {
  return typeof value === "boolean" ? value : fallback
}

function safeEnum<T extends string>(value: unknown, options: readonly T[], fallback: T) {
  return typeof value === "string" && options.includes(value as T) ? (value as T) : fallback
}

function asRecord(value: unknown) {
  return isRecord(value) ? value : {}
}

function normalizeBooleanFields<T extends Record<string, boolean>>(
  value: Record<string, unknown>,
  defaults: T,
  keys: readonly (keyof T)[],
): T {
  return Object.fromEntries(
    keys.map((key) => [key, safeBoolean(value[String(key)], defaults[key])]),
  ) as T
}

function normalizeVisibility(
  value: Record<string, unknown>,
  defaults: WidgetVisibility,
): WidgetVisibility {
  return normalizeBooleanFields(value, defaults, VISIBILITY_KEYS)
}

function toggleRotationField(
  fields: WidgetRotationField[],
  field: WidgetRotationField,
  enabled: boolean,
) {
  if (enabled) {
    return fields.includes(field) ? fields : [...fields, field]
  }

  return fields.filter((current) => current !== field)
}

function normalizeStyle(value: Record<string, unknown>, defaults: WidgetStyle): WidgetStyle {
  return {
    font: safeEnum(value.font, FONT_IDS, defaults.font),
    scale: clamp(value.scale, 0.65, 1.5, defaults.scale),
    density: safeEnum(value.density, DENSITY_IDS, defaults.density),
    background: safeEnum(value.background, BACKGROUND_IDS, defaults.background),
    accent: safeColor(value.accent, defaults.accent),
    text: safeColor(value.text, defaults.text),
    mutedText: safeColor(value.mutedText, defaults.mutedText),
    surface: safeColor(value.surface, defaults.surface),
    surfaceMuted: safeColor(value.surfaceMuted, defaults.surfaceMuted),
    borderEnabled: safeBoolean(value.borderEnabled, defaults.borderEnabled),
    border: safeColor(value.border, defaults.border),
    radius: clamp(value.radius, 0, 20, defaults.radius),
    opacity: clamp(value.opacity, 0.2, 1, defaults.opacity),
  }
}

function isRotationField(value: unknown): value is WidgetRotationField {
  return typeof value === "string" && ROTATION_FIELDS.includes(value as WidgetRotationField)
}

function normalizeRotationFields(value: unknown, fallback: WidgetRotationField[]) {
  if (!Array.isArray(value)) return [...fallback]

  return [...new Set(value.filter(isRotationField))]
}

function normalizeRotation(
  value: Record<string, unknown>,
  defaults: WidgetRotation,
  preset: WidgetConfig["preset"],
): WidgetRotation {
  const allowedFields = getRotationFields(preset)

  return {
    enabled: supportsWidgetRotation(preset) && safeBoolean(value.enabled, defaults.enabled),
    intervalMs: clamp(value.intervalMs, 1800, 12000, defaults.intervalMs),
    fields: normalizeRotationFields(value.fields, defaults.fields).filter((field) =>
      allowedFields.includes(field),
    ),
  }
}

function getPreset(value: unknown): WidgetConfig["preset"] {
  return isWidgetPresetId(value)
    ? value
    : DEFAULT_WIDGET_CONFIG.preset
}

export function createDefaultConfig(preset: WidgetConfig["preset"] = "elo-pill"): WidgetConfig {
  const selectedPreset = WIDGET_PRESET_MAP[preset] ?? WIDGET_PRESET_MAP["elo-pill"]

  return {
    ...DEFAULT_WIDGET_CONFIG,
    preset: selectedPreset.id,
    visibility: { ...selectedPreset.defaultVisibility },
    style: {
      ...DEFAULT_WIDGET_CONFIG.style,
      ...selectedPreset.defaultStyle,
    },
    rotation: {
      ...DEFAULT_WIDGET_CONFIG.rotation,
      enabled: selectedPreset.supportsRotation,
      fields: [
        ...(selectedPreset.defaultRotationFields ?? DEFAULT_WIDGET_CONFIG.rotation.fields),
      ],
    },
  }
}

export function updateVisibilityConfig(
  config: WidgetConfig,
  key: WidgetVisibilityKey,
  value: boolean,
) {
  const rotationField = ROTATION_VISIBILITY_FIELDS[key]
  const rotation = rotationField && supportsWidgetRotation(config.preset)
    ? {
        ...config.rotation,
        fields: toggleRotationField(config.rotation.fields, rotationField, value),
      }
    : config.rotation

  return normalizeConfig({
    ...config,
    visibility: { ...config.visibility, [key]: value },
    rotation,
  })
}

export function normalizeConfig(input: unknown): WidgetConfig {
  const value = asRecord(input)
  const preset = getPreset(value.preset)
  const defaults = createDefaultConfig(preset)

  return {
    version: 1,
    preset,
    visibility: normalizeVisibility(asRecord(value.visibility), defaults.visibility),
    style: normalizeStyle(asRecord(value.style), defaults.style),
    rotation: normalizeRotation(asRecord(value.rotation), defaults.rotation, preset),
  }
}
