import { SITE_PATHS } from "../lib/site-metadata"

const LEGACY_PAGE_REDIRECTS = new Map([
  ["/guides/faceit-widget-obs", "/faceit-widget-obs/"],
  ["/guides/faceit-widget-obs/", "/faceit-widget-obs/"],
  ["/guides/live-faceit-stats", "/live-faceit-stats/"],
  ["/guides/live-faceit-stats/", "/live-faceit-stats/"],
])

const STATIC_PAGE_PATHS = new Set([
  ...Object.values(SITE_PATHS),
  "/builder/",
  "/widget/",
])

function canonicalPath(pathname: string) {
  if (pathname === "/" || pathname.endsWith("/")) return pathname

  const withTrailingSlash = `${pathname}/`
  return STATIC_PAGE_PATHS.has(withTrailingSlash) ? withTrailingSlash : pathname
}

export function canonicalPageRedirect(request: Request) {
  if (request.method !== "GET" && request.method !== "HEAD") return null

  const url = new URL(request.url)
  const legacyPath = LEGACY_PAGE_REDIRECTS.get(url.pathname)
  if (legacyPath) {
    url.pathname = legacyPath
    return Response.redirect(url, 308)
  }

  const pathname = canonicalPath(url.pathname)
  if (pathname === url.pathname) return null

  url.pathname = pathname
  return Response.redirect(url, 308)
}

const RSC_ASSET_PATH = /^(.*)\/__next\.([^.]+(?:\.[^.]+)*)\.__PAGE__\.txt$/

export function staticRscAssetRequest(request: Request) {
  if (request.method !== "GET" && request.method !== "HEAD") return null

  const url = new URL(request.url)
  const match = url.pathname.match(RSC_ASSET_PATH)
  if (!match) return null

  const [, routePrefix, dottedRoute] = match
  const [rootSegment, ...nestedSegments] = dottedRoute.split(".")
  const nestedPath = nestedSegments.length > 0 ? `/${nestedSegments.join("/")}` : ""
  url.pathname = `${routePrefix}/__next.${rootSegment}${nestedPath}/__PAGE__.txt`

  return new Request(url, request)
}
