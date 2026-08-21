export type AnalyticsEvent = "page_view" | "builder_opened" | "preset_selected"

type AnalyticsParams = Record<string, string | number | boolean>
const campaignParams = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "utm_id",
]

declare global {
  interface Window {
    gtag?: (command: string, event: string, params?: AnalyticsParams) => void
  }
}

export function trackEvent(name: AnalyticsEvent, params?: AnalyticsParams) {
  if (typeof window === "undefined") return
  window.gtag?.("event", name, params)
}

export function cleanCampaignParams() {
  if (typeof window === "undefined") return

  const url = new URL(window.location.href)
  const hadCampaignParams = campaignParams.some((param) => url.searchParams.has(param))

  if (!hadCampaignParams) return

  campaignParams.forEach((param) => url.searchParams.delete(param))
  window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`)
}
