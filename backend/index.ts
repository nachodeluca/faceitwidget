import { errorResponse, ApiError } from "./errors"
import { isValidTimezone, parsePlayerLookup, playerLookupKey } from "../lib/widget/data/player-lookup"
import type { WorkerEnv } from "./env"
import { canonicalPageRedirect, staticRscAssetRequest } from "./page-routing"
import { serveAgentDocument, serveNotFound } from "./markdown"
import { createSharedWidget, sharedWidgetPage } from "./share-routes"

export { PlayerSnapshotCoordinator } from "./snapshot-coordinator"
export { SharedWidgetCard } from "./shared-widget-card"

const PLAYER_ROUTE = /^\/api\/v1\/players\/([^/]+)\/(snapshot|live)\/?$/

async function enforceRateLimits(request: Request, env: WorkerEnv, lookupKey?: string) {
  const ip = request.headers.get("CF-Connecting-IP") ?? "local"
  const apiLimit = await env.API_RATE_LIMIT.limit({ key: ip })
  if (!apiLimit.success) throw new ApiError(429, "Too many requests. Try again in a minute.", 60_000)

  if (lookupKey) {
    const playerLimit = await env.PLAYER_RATE_LIMIT.limit({ key: `${ip}:${lookupKey}` })
    if (!playerLimit.success) throw new ApiError(429, "This player is being refreshed too often.", 60_000)
  }
}

async function sharedWidgetRequest(request: Request, env: WorkerEnv) {
  const ip = request.headers.get("CF-Connecting-IP") ?? "local"
  const rateLimit = await env.SHARE_RATE_LIMIT.limit({ key: ip })
  if (!rateLimit.success) throw new ApiError(429, "Too many widget images. Try again in a minute.", 60_000)
  return createSharedWidget(request, env)
}

async function playerRequest(request: Request, env: WorkerEnv, match: RegExpMatchArray) {
  if (request.method !== "GET") {
    throw new ApiError(405, "This endpoint only accepts GET requests.")
  }

  const rawLookup = decodeURIComponent(match[1])
  const route = match[2]
  const lookup = parsePlayerLookup(rawLookup)
  const url = new URL(request.url)
  const timezone = url.searchParams.get("tz") ?? "UTC"

  if (!lookup) throw new ApiError(400, "Enter a valid FACEIT nickname or player ID.")
  if (!isValidTimezone(timezone)) throw new ApiError(400, "Enter a valid IANA timezone.")
  await enforceRateLimits(request, env, playerLookupKey(lookup))

  const id = env.PLAYER_SNAPSHOTS.idFromName(playerLookupKey(lookup))
  const stub = env.PLAYER_SNAPSHOTS.get(id)
  const internalUrl = new URL(`https://player.internal/${route}`)
  internalUrl.searchParams.set("lookup", lookup.value)
  internalUrl.searchParams.set("tz", timezone)

  return stub.fetch(new Request(internalUrl, {
    method: request.method,
    headers: request.headers,
  }))
}

export default {
  async fetch(request: Request, env: WorkerEnv) {
    try {
      const url = new URL(request.url)
      const pageRedirect = canonicalPageRedirect(request)
      if (pageRedirect) return pageRedirect

      const rscAssetRequest = staticRscAssetRequest(request)
      if (rscAssetRequest) return env.ASSETS.fetch(rscAssetRequest)

      const agentDocument = await serveAgentDocument(request, env.ASSETS)
      if (agentDocument) return agentDocument

      const playerMatch = url.pathname.match(PLAYER_ROUTE)
      if (playerMatch) return await playerRequest(request, env, playerMatch)
      if (url.pathname === "/api/v1/shares") return await sharedWidgetRequest(request, env)

      const shareResponse = await sharedWidgetPage(request, env)
      if (shareResponse) return shareResponse

      if (url.pathname.startsWith("/api/")) {
        throw new ApiError(404, "Unknown API route.")
      }

      const assetResponse = await env.ASSETS.fetch(request)
      return assetResponse.status === 404 ? serveNotFound(request, assetResponse) : assetResponse
    } catch (error) {
      return errorResponse(error)
    }
  },
} satisfies ExportedHandler<WorkerEnv>
