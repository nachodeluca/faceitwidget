import {
  CUSTOM_UPLOAD_LIMITS,
  uploadMediaForType,
  type CustomUploadMedia,
} from "./upload-contract"
import { isCustomBackdropRecord, type CustomBackdropRecord } from "./custom"

type Fetcher = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>
type SignedUpload = { url: string; headers: Record<string, string> }
type UploadOptions = { fetcher?: Fetcher; onProgress?: (value: number) => void }
type IntentResponse = {
  asset: CustomBackdropRecord
  upload: { source: SignedUpload; poster: SignedUpload | null }
}

function uploadError(message: string) {
  return new Error(message)
}

async function responseJson<T>(response: Response): Promise<T> {
  const body: unknown = await response.json().catch(() => null)
  if (!response.ok) {
    const message = body && typeof body === "object" && "error" in body
      ? String(body.error)
      : "The background upload could not be completed."
    throw uploadError(message)
  }
  return body as T
}

function validateFile(file: File): CustomUploadMedia {
  const media = uploadMediaForType(file.type)
  if (!media) throw uploadError("Use a WebP, PNG, JPG, or MP4 background.")

  const limit = CUSTOM_UPLOAD_LIMITS[media]
  if (file.size > limit) throw uploadError(`This ${media} is larger than the upload limit.`)
  return media
}

export function createVideoPoster(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video")
    const sourceUrl = URL.createObjectURL(file)
    let settled = false

    const finish = (callback: () => void) => {
      if (settled) return
      settled = true
      window.clearTimeout(timeout)
      URL.revokeObjectURL(sourceUrl)
      video.remove()
      callback()
    }
    const fail = () => finish(() => reject(uploadError("This video could not be previewed.")))
    const capture = () => {
      if (!video.videoWidth || !video.videoHeight) return fail()
      const scale = Math.min(1, 640 / video.videoWidth)
      const canvas = document.createElement("canvas")
      canvas.width = Math.max(1, Math.round(video.videoWidth * scale))
      canvas.height = Math.max(1, Math.round(video.videoHeight * scale))
      canvas.getContext("2d")?.drawImage(video, 0, 0, canvas.width, canvas.height)
      canvas.toBlob((blob) => {
        if (!blob || blob.size > CUSTOM_UPLOAD_LIMITS.poster) return fail()
        finish(() => resolve(blob))
      }, "image/webp", 0.82)
    }
    const timeout = window.setTimeout(fail, 10_000)

    video.muted = true
    video.preload = "metadata"
    video.onloadeddata = capture
    video.onerror = fail
    video.src = sourceUrl
    video.load()
  })
}

async function putObject(fetcher: Fetcher, upload: SignedUpload, body: BodyInit) {
  const response = await fetcher(upload.url, { method: "PUT", headers: upload.headers, body })
  if (!response.ok) throw uploadError("R2 rejected the background upload.")
}

async function createIntent(fetcher: Fetcher, file: File, media: CustomUploadMedia): Promise<IntentResponse> {
  const response = await fetcher("/api/v1/backgrounds/intents", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ media, contentType: file.type, size: file.size }),
  })
  return responseJson<IntentResponse>(response)
}

async function completeUpload(fetcher: Fetcher, asset: CustomBackdropRecord) {
  const response = await fetcher("/api/v1/backgrounds/complete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: asset.id, media: asset.media }),
  })
  const result = await responseJson<{ asset: CustomBackdropRecord }>(response)
  if (!isCustomBackdropRecord(result.asset)) throw uploadError("The uploaded background is invalid.")
  return result.asset
}

export async function uploadCustomBackdrop(file: File, options: UploadOptions = {}) {
  const fetcher = options.fetcher ?? fetch
  const onProgress = options.onProgress ?? (() => undefined)
  const media = validateFile(file)
  const poster = media === "video" ? await createVideoPoster(file) : null
  if (poster && poster.size > CUSTOM_UPLOAD_LIMITS.poster) {
    throw uploadError("The video preview is larger than the upload limit.")
  }

  onProgress(10)
  const intent = await createIntent(fetcher, file, media)
  onProgress(30)
  await putObject(fetcher, intent.upload.source, file)
  onProgress(media === "video" ? 70 : 85)
  if (poster && intent.upload.poster) await putObject(fetcher, intent.upload.poster, poster)
  const asset = await completeUpload(fetcher, intent.asset)
  onProgress(100)
  return asset
}
