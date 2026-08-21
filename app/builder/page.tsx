import type { Metadata } from "next"
import { Suspense } from "react"

import { MapIconPreloads } from "@/components/widget/map-icon-preloads"

import { BuilderClient } from "./builder-client"

export const metadata: Metadata = {
  title: "Widget builder",
  robots: { index: false, follow: false, nocache: true },
}

export default function BuilderPage() {
  return (
    <>
      <MapIconPreloads />
      <Suspense fallback={<main className="min-h-screen bg-background" />}>
        <BuilderClient />
      </Suspense>
    </>
  )
}
