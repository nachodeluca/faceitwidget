import { ApiError } from "./errors"
import type { WorkerEnv } from "./env"

const MAX_IMAGE_BYTES = 2 * 1024 * 1024
const SHARE_PAGE_PATTERN = /^\/s\/([a-f0-9]{12})(?:\/(image\.png))?\/?$/
const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] as const

function cleanLabel(value: string | null, fallback: string) {
  const cleaned = value?.trim().replace(/[^a-z0-9_-]/gi, "").slice(0, 32)
  return cleaned || fallback
}

function isPng(bytes: Uint8Array) {
  return PNG_SIGNATURE.every((byte, index) => bytes[index] === byte)
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;",
  })[character] ?? character)
}

function shareStub(env: WorkerEnv, shareId: string) {
  return env.SHARED_WIDGETS.get(env.SHARED_WIDGETS.idFromName(shareId))
}

type SharedPageOptions = {
  title: string
  description: string
  pageUrl: string
  imageUrl: string
  builderUrl: string
}

function renderSharedPage({ title, description, pageUrl, imageUrl, builderUrl }: SharedPageOptions) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="robots" content="noindex,nofollow,noarchive">
  <title>${title}</title>
  <meta name="description" content="${description}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${pageUrl}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${imageUrl}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${imageUrl}">
  <meta name="twitter:image:alt" content="${title}">
  <style>
    html { color-scheme: dark }
    body { min-height: 100vh; margin: 0; display: grid; place-items: center; background: #121212; color: #fff; font: 500 16px system-ui, sans-serif }
    .card { width: min(720px, calc(100% - 32px)); text-align: center }
    .card img { display: block; max-width: 100%; height: auto; margin: 0 auto 28px }
    .card a { display: inline-flex; padding: 12px 16px; border-radius: 10px; background: #fff; color: #111; text-decoration: none; font-weight: 700 }
  </style>
</head>
<body><main class="card"><img src="${imageUrl}" alt="${title}"><a href="${builderUrl}">Create your widget</a></main></body>
</html>`
}

export async function createSharedWidget(request: Request, env: WorkerEnv) {
  if (request.method !== "POST") {
    throw new ApiError(405, "This endpoint only accepts POST requests.")
  }

  const contentLength = Number(request.headers.get("Content-Length"))
  if (Number.isFinite(contentLength) && contentLength > MAX_IMAGE_BYTES) {
    throw new ApiError(413, "The widget image is too large.")
  }

  const image = await request.arrayBuffer()
  if (image.byteLength === 0 || image.byteLength > MAX_IMAGE_BYTES || !isPng(new Uint8Array(image))) {
    throw new ApiError(400, "Upload a valid PNG widget image under 2 MB.")
  }

  const shareId = crypto.randomUUID().replaceAll("-", "").slice(0, 12)
  const nickname = cleanLabel(request.headers.get("X-Widget-Nickname"), "FACEIT-player")
  const preset = cleanLabel(request.headers.get("X-Widget-Preset"), "widget")
  const internalRequest = new Request("https://share.internal/", {
    method: "POST",
    body: image,
    headers: {
      "Content-Type": "image/png",
      "X-Widget-Nickname": nickname,
      "X-Widget-Preset": preset,
    },
  })

  await shareStub(env, shareId).fetch(internalRequest)

  const origin = new URL(request.url).origin
  return Response.json({ shareUrl: `${origin}/s/${shareId}/` }, {
    status: 201,
    headers: { "Cache-Control": "no-store" },
  })
}

export async function sharedWidgetPage(request: Request, env: WorkerEnv) {
  const match = new URL(request.url).pathname.match(SHARE_PAGE_PATTERN)
  if (!match || request.method !== "GET") return undefined

  const shareId = match[1]
  const asset = match[2]
  const stub = shareStub(env, shareId)

  if (asset === "image.png") {
    return stub.fetch("https://share.internal/image.png")
  }

  const metadataResponse = await stub.fetch("https://share.internal/metadata")
  if (!metadataResponse.ok) return new Response("Shared widget not found.", { status: 404 })

  const metadata = await metadataResponse.json<{ nickname: string; preset: string }>()
  const nickname = escapeHtml(metadata.nickname)
  const origin = new URL(request.url).origin
  const pageUrl = `${origin}/s/${shareId}/`
  const imageUrl = `${origin}/s/${shareId}/image.png`
  const builderUrl = `${origin}/builder/?nickname=${encodeURIComponent(metadata.nickname)}`
  const title = `${nickname}'s FACEIT stats widget`
  const description = `Live FACEIT stats overlay created with faceitwidget.com.`

  return new Response(renderSharedPage({ title, description, pageUrl, imageUrl, builderUrl }), {
    headers: {
      "Cache-Control": "public, max-age=3600",
      "Content-Type": "text/html; charset=utf-8",
      "X-Robots-Tag": "noindex, nofollow, noarchive",
    },
  })
}
