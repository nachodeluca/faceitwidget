"use client"

import { useEffect, useRef, useState } from "react"
import Script from "next/script"
import { usePathname } from "next/navigation"

import { cleanCampaignParams, trackEvent } from "@/lib/analytics"

const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

function shouldTrack(pathname: string | null) {
  return Boolean(measurementId) && pathname !== "/widget" && pathname !== "/widget/"
}

export function GoogleAnalytics() {
  const pathname = usePathname()
  const [scriptReady, setScriptReady] = useState(false)
  const trackedPath = useRef<string | null>(null)

  useEffect(() => {
    if (!shouldTrack(pathname) || !scriptReady || !pathname) return
    if (trackedPath.current === pathname) return

    trackedPath.current = pathname
    trackEvent("page_view", {
      page_path: pathname,
      page_location: window.location.href,
    })
    cleanCampaignParams()
  }, [pathname, scriptReady])

  if (!shouldTrack(pathname)) return null

  return (
    <>
      <Script id="google-analytics-config" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('consent', 'default', {
            analytics_storage: 'granted',
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied'
          });
          gtag('js', new Date());
          gtag('config', '${measurementId}', { send_page_view: false });
        `}
      </Script>
      <Script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
        onReady={() => setScriptReady(true)}
      />
    </>
  )
}
