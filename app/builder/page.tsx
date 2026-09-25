import type { Metadata } from "next"
import { Suspense } from "react"

import { MapIconPreloads } from "@/components/widget/map-icon-preloads"
import { AnnouncementBar } from "@/components/site/announcement-bar"
import { APP_PATHS, createLandingMetadata } from "@/lib/site-metadata"

import { BuilderClient } from "./builder-client"

const title = "FACEIT Widget Builder for OBS"
const description =
  "Build a free FACEIT widget for OBS or Streamlabs. Customize live CS2 ELO, rank, K/D, recent matches, colors, layout, and animation."

export const metadata: Metadata = {
  ...createLandingMetadata({ title, description, path: APP_PATHS.builder }),
  robots: { index: true, follow: true },
}

export default function BuilderPage() {
  return (
    <>
      <AnnouncementBar />
      <MapIconPreloads />
      <Suspense fallback={<main className="min-h-screen bg-background" />}>
        <BuilderClient />
      </Suspense>
    </>
  )
}
