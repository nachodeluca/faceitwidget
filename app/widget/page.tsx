import type { Metadata } from "next"
import { Suspense } from "react"

import { WidgetClient } from "./widget-client"

export const metadata: Metadata = {
  title: "FACEIT widget",
  robots: { index: false, follow: false, nocache: true },
}

export default function WidgetPage() {
  return (
    <main className="flex min-h-screen items-start justify-start bg-transparent">
      <Suspense fallback={null}>
        <WidgetClient />
      </Suspense>
    </main>
  )
}
