import { AwsClient } from "aws4fetch"

import { isRecord } from "../lib/utils"
import { isCustomBackdropId } from "../lib/widget/backgrounds/custom-contract"
import type { CustomWidgetBackdropId } from "../lib/widget/backgrounds/types"
import {
  CUSTOM_UPLOAD_LIMITS,
  CUSTOM_UPLOAD_TYPES,
  type CustomUploadMedia,
} from "../lib/widget/backgrounds/upload-contract"
import { ApiError } from "./errors"
import type { WorkerEnv } from "./env"

const PRESIGNED_URL_TTL = 900
const S3_REGION = "auto"
const S3_SERVICE = "s3"
const ALLOWED_ORIGINS = new Set([
  "https://faceitwidget.com",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:8787",
  "http://127.0.0.1:8787",
])

type UploadRequest = { media: CustomUploadMedia; contentType: string; size: number }
type CompleteRequest = { id: CustomWidgetBackdropId; media: CustomUploadMedia }

const CONTENT_TYPES = {
  image: new Set<string>(CUSTOM_UPLOAD_TYPES.image),
  video: new Set<string>(CUSTOM_UPLOAD_TYPES.video),
} as const

function corsHeaders(request: Request) {
  const origin = request.headers.get("Origin")
  const headers = new Headers({
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin",
  })
  if (origin && ALLOWED_ORIGINS.has(origin)) headers.set("Access-Control-Allow-Origin", origin)
  return headers
}

function jsonResponse(request: Request, body: unknown, status = 200) {
  const headers = corsHeaders(request)
  headers.set("Cache-Control", "no-store")
  headers.set("Content-Type", "application/json; charset=utf-8")
  return Response.json(body, { status, headers })
}

function requireMethod(request: Request, method: string) {
  if (request.method !== method) throw new ApiError(405, `This endpoint only accepts ${method} requests.`)
}

async function requestBody(request: Request) {
  try {
    const value: unknown = await request.json()
    if (isRecord(value)) return value
  } catch {
  }
  throw new ApiError(400, "Send a valid JSON request body.")
}

function uploadMedia(value: unknown): CustomUploadMedia {
  if (value === "image" || value === "video") return value
  throw new ApiError(400, "Choose an image or video background.")
}

function uploadSize(value: unknown, media: CustomUploadMedia) {
  const limit = media === "video" ? CUSTOM_UPLOAD_LIMITS.video : CUSTOM_UPLOAD_LIMITS.image
  if (typeof value !== "number" || !Number.isInteger(value) || value < 1 || value > limit) {
    throw new ApiError(413, `This ${media} is larger than the upload limit.`)
  }
  return value
}

function uploadContentType(value: unknown, media: CustomUploadMedia) {
  if (typeof value !== "string" || !CONTENT_TYPES[media].has(value)) {
    throw new ApiError(415, "This file type is not supported.")
  }
  return value
}

function parseUploadRequest(body: Record<string, unknown>): UploadRequest {
  const media = uploadMedia(body.media)
  return {
    media,
    contentType: uploadContentType(body.contentType, media),
    size: uploadSize(body.size, media),
  }
}

function parseCompleteRequest(body: Record<string, unknown>): CompleteRequest {
  if (!isCustomBackdropId(body.id)) throw new ApiError(400, "The background upload ID is invalid.")
  return { id: body.id, media: uploadMedia(body.media) }
}

function configuredValue(value: string | undefined, name: string) {
  if (!value?.trim()) throw new ApiError(503, `Custom backgrounds are not configured: ${name}.`)
  return value.trim()
}

function objectUrl(env: WorkerEnv, key: string) {
  const accountId = configuredValue(env.R2_ACCOUNT_ID, "missing R2 account")
  const bucket = configuredValue(env.R2_BUCKET_NAME, "missing R2 bucket")
  const encodedKey = key.split("/").map(encodeURIComponent).join("/")
  return `https://${accountId}.r2.cloudflarestorage.com/${bucket}/${encodedKey}`
}

function publicUrl(env: WorkerEnv, key: string) {
  const base = configuredValue(env.R2_PUBLIC_BASE_URL, "missing R2 public URL").replace(/\/$/, "")
  return `${base}/${key}`
}

function signer(env: WorkerEnv) {
  return new AwsClient({
    accessKeyId: configuredValue(env.R2_ACCESS_KEY_ID, "missing R2 access key"),
    secretAccessKey: configuredValue(env.R2_SECRET_ACCESS_KEY, "missing R2 secret key"),
    service: S3_SERVICE,
    region: S3_REGION,
  })
}

async function signedUpload(env: WorkerEnv, key: string, contentType: string) {
  const target = new URL(objectUrl(env, key))
  target.searchParams.set("X-Amz-Expires", String(PRESIGNED_URL_TTL))
  const request = await signer(env).sign(target.toString(), {
    method: "PUT",
    headers: { "Content-Type": contentType },
    aws: { signQuery: true, allHeaders: true },
  })

  return { url: request.url.toString(), headers: { "Content-Type": contentType } }
}

function assetResponse(env: WorkerEnv, id: CustomWidgetBackdropId, media: CustomUploadMedia) {
  const sourceKey = `custom/${id}/source`
  const posterKey = `custom/${id}/poster.webp`
  return {
    id,
    media,
    sourceUrl: publicUrl(env, sourceKey),
    ...(media === "video" ? { posterUrl: publicUrl(env, posterKey) } : {}),
    createdAt: new Date().toISOString(),
  }
}

async function enforceBackgroundRateLimit(request: Request, env: WorkerEnv) {
  const ip = request.headers.get("CF-Connecting-IP") ?? "local"
  const result = await env.BACKGROUND_RATE_LIMIT.limit({ key: ip })
  if (!result.success) throw new ApiError(429, "Too many background uploads. Try again in a minute.", 60_000)
}

async function createIntent(request: Request, env: WorkerEnv) {
  requireMethod(request, "POST")
  await enforceBackgroundRateLimit(request, env)
  const body = await requestBody(request)
  const upload = parseUploadRequest(body)
  const id = crypto.randomUUID() as CustomWidgetBackdropId
  const sourceKey = `custom/${id}/source`
  const posterKey = `custom/${id}/poster.webp`
  const source = await signedUpload(env, sourceKey, upload.contentType)
  const poster = upload.media === "video" ? await signedUpload(env, posterKey, "image/webp") : null

  return jsonResponse(request, {
    asset: assetResponse(env, id, upload.media),
    upload: { source, poster, maxPosterBytes: CUSTOM_UPLOAD_LIMITS.poster },
  })
}

function isValidObject(object: R2Object | null, maxBytes: number, contentTypes: Set<string>) {
  return Boolean(
    object &&
      object.size > 0 &&
      object.size <= maxBytes &&
      (!object.httpMetadata?.contentType || contentTypes.has(object.httpMetadata.contentType)),
  )
}

async function completeUpload(request: Request, env: WorkerEnv) {
  requireMethod(request, "POST")
  const body = parseCompleteRequest(await requestBody(request))
  const sourceKey = `custom/${body.id}/source`
  const source = await env.USER_BACKGROUNDS.head(sourceKey)
  const sourceLimit = body.media === "video" ? CUSTOM_UPLOAD_LIMITS.video : CUSTOM_UPLOAD_LIMITS.image
  if (!isValidObject(source, sourceLimit, CONTENT_TYPES[body.media])) {
    await env.USER_BACKGROUNDS.delete(sourceKey)
    throw new ApiError(400, "The uploaded background could not be verified.")
  }

  if (body.media === "video") {
    const posterKey = `custom/${body.id}/poster.webp`
    const poster = await env.USER_BACKGROUNDS.head(posterKey)
    if (!isValidObject(poster, CUSTOM_UPLOAD_LIMITS.poster, new Set(["image/webp"]))) {
      await env.USER_BACKGROUNDS.delete([sourceKey, posterKey])
      throw new ApiError(400, "The video preview could not be verified.")
    }
  }

  return jsonResponse(request, { asset: assetResponse(env, body.id, body.media) })
}

export function isBackgroundRoute(pathname: string) {
  return pathname === "/api/v1/backgrounds/intents" || pathname === "/api/v1/backgrounds/complete"
}

export async function backgroundRequest(request: Request, env: WorkerEnv) {
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders(request) })
  if (new URL(request.url).pathname.endsWith("/intents")) return createIntent(request, env)
  return completeUpload(request, env)
}
