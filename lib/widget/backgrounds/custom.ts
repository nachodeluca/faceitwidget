import type {
  CustomWidgetBackdropId,
  WidgetBackdropAsset,
  WidgetBackdropMedia,
} from "./types"
import { isCustomBackdropId } from "./custom-contract"

export const CUSTOM_BACKDROP_STORAGE_KEY = "faceitwidget.custom-backgrounds.v1"
export const CUSTOM_BACKDROP_LIMIT = 10

const DEFAULT_PUBLIC_BASE_URL = "https://assets.faceitwidget.com"

export type CustomBackdropRecord = {
  id: CustomWidgetBackdropId
  media: WidgetBackdropMedia
  sourceUrl: string
  posterUrl?: string
  createdAt: string
}

type StorageLike = Pick<Storage, "getItem" | "setItem">

function publicBaseUrl() {
  const configured = typeof process !== "undefined"
    ? process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL?.trim()
    : undefined
  return (configured || DEFAULT_PUBLIC_BASE_URL).replace(/\/$/, "")
}

function isHttpUrl(value: unknown): value is string {
  return typeof value === "string" && /^https?:\/\/[^\s]+$/i.test(value)
}

function backdropUrl(id: CustomWidgetBackdropId, file: "source" | "poster.webp") {
  return `${publicBaseUrl()}/custom/${id}/${file}`
}

export function isCustomBackdropMedia(value: unknown): value is WidgetBackdropMedia {
  return value === "image" || value === "video"
}

export function createCustomBackdropAsset(
  id: CustomWidgetBackdropId,
  media: WidgetBackdropMedia,
  sourceUrl = backdropUrl(id, "source"),
  posterUrl?: string,
): WidgetBackdropAsset {
  return {
    id,
    label: "Custom background",
    media,
    src: sourceUrl,
    posterSrc: media === "video" ? posterUrl ?? backdropUrl(id, "poster.webp") : sourceUrl,
    custom: true,
  }
}

export function isCustomBackdropRecord(value: unknown): value is CustomBackdropRecord {
  if (!value || typeof value !== "object") return false
  const record = value as Record<string, unknown>

  return (
    isCustomBackdropId(record.id) &&
    isCustomBackdropMedia(record.media) &&
    isHttpUrl(record.sourceUrl) &&
    (record.media === "image" || isHttpUrl(record.posterUrl)) &&
    typeof record.createdAt === "string"
  )
}

function normalizeRecord(record: CustomBackdropRecord): CustomBackdropRecord {
  if (record.media === "video") return record

  return {
    id: record.id,
    media: record.media,
    sourceUrl: record.sourceUrl,
    createdAt: record.createdAt,
  }
}

function browserStorage(storage?: StorageLike) {
  if (storage) return storage
  if (typeof window === "undefined") return null
  try {
    return window.localStorage
  } catch {
    return null
  }
}

export function readCustomBackdrops(storage?: StorageLike): CustomBackdropRecord[] {
  const target = browserStorage(storage)
  if (!target) return []

  const serialized = target.getItem(CUSTOM_BACKDROP_STORAGE_KEY) ?? "[]"
  const records = parseCustomBackdrops(serialized)
  const normalized = JSON.stringify(records)

  if (normalized !== serialized) {
    try {
      target.setItem(CUSTOM_BACKDROP_STORAGE_KEY, normalized)
    } catch {
    }
  }

  return records
}

export function parseCustomBackdrops(serialized: string): CustomBackdropRecord[] {
  try {
    const value: unknown = JSON.parse(serialized)
    return Array.isArray(value)
      ? value.filter(isCustomBackdropRecord).map(normalizeRecord).slice(-CUSTOM_BACKDROP_LIMIT)
      : []
  } catch {
    return []
  }
}

export function saveCustomBackdrops(records: CustomBackdropRecord[], storage?: StorageLike) {
  const target = browserStorage(storage)
  if (!target) return records

  const next = records.filter(isCustomBackdropRecord).map(normalizeRecord).slice(-CUSTOM_BACKDROP_LIMIT)
  try {
    target.setItem(CUSTOM_BACKDROP_STORAGE_KEY, JSON.stringify(next))
  } catch {
    return readCustomBackdrops(target)
  }
  return next
}

export function addCustomBackdrop(record: CustomBackdropRecord, storage?: StorageLike) {
  if (!isCustomBackdropRecord(record)) return readCustomBackdrops(storage)

  const records = readCustomBackdrops(storage).filter((current) => current.id !== record.id)
  return saveCustomBackdrops([...records, record], storage)
}
