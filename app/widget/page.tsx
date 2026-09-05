import type { Metadata } from "next"
import { Suspense } from "react"

import { APP_PATHS } from "@/lib/site-metadata"

import { WidgetClient } from "./widget-client"

export const metadata: Metadata = {
  title: "FACEIT widget",
  alternates: { canonical: APP_PATHS.widget },
  robots: { index: false, follow: true, nocache: true },
}

export default function WidgetPage() {
  return (
    <main data-widget-page className="flex min-h-screen items-start justify-start bg-transparent">
      <Suspense fallback={null}>
        <WidgetClient />
      </Suspense>
    </main>
  )
}
