export type CustomUploadMedia = "image" | "video"

export const CUSTOM_UPLOAD_LIMITS = {
  image: 5 * 1024 * 1024,
  video: 15 * 1024 * 1024,
  poster: 1 * 1024 * 1024,
} as const

export const CUSTOM_UPLOAD_TYPES = {
  image: ["image/webp", "image/png", "image/jpeg"],
  video: ["video/mp4"],
  poster: ["image/webp"],
} as const

export function uploadMediaForType(contentType: string): CustomUploadMedia | null {
  if (CUSTOM_UPLOAD_TYPES.image.includes(contentType as (typeof CUSTOM_UPLOAD_TYPES.image)[number])) {
    return "image"
  }
  return CUSTOM_UPLOAD_TYPES.video.includes(contentType as (typeof CUSTOM_UPLOAD_TYPES.video)[number])
    ? "video"
    : null
}
