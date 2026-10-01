import type { Metadata } from "next"
import { Suspense } from "react"

import { MapIconPreloads } from "@/components/widget/map-icon-preloads"
import { AnnouncementBar } from "@/components/site/announcement-bar"
import { absoluteSiteUrl, APP_PATHS, createLandingMetadata, SITE_METADATA } from "@/lib/site-metadata"

import { BuilderClient } from "./builder-client"

const title = "FACEIT Widget Builder for OBS"
const description =
  "Build a free FACEIT widget for OBS or Streamlabs. Customize live CS2 ELO, rank, K/D, recent matches, colors, layout, and animation."
const builderUrl = absoluteSiteUrl(APP_PATHS.builder)
const webApplicationId = `${builderUrl}#webapplication`
const webPageId = `${builderUrl}#webpage`
const breadcrumbId = `${builderUrl}#breadcrumb`

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": webApplicationId,
      name: title,
      url: builderUrl,
      description,
      applicationCategory: "MultimediaApplication",
      operatingSystem: "Any",
      browserRequirements: "Requires JavaScript and a modern browser.",
      isAccessibleForFree: true,
      mainEntityOfPage: { "@id": webPageId },
    },
    {
      "@type": "WebPage",
      "@id": webPageId,
      url: builderUrl,
      name: title,
      description,
      inLanguage: "en",
      isPartOf: { "@id": `${SITE_METADATA.url}/#website` },
      mainEntity: { "@id": webApplicationId },
      breadcrumb: { "@id": breadcrumbId },
    },
    {
      "@type": "BreadcrumbList",
      "@id": breadcrumbId,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_METADATA.url}/` },
        { "@type": "ListItem", position: 2, name: "Builder", item: builderUrl },
      ],
    },
  ],
}

export const metadata: Metadata = {
  ...createLandingMetadata({ title, description, path: APP_PATHS.builder }),
  robots: { index: true, follow: true },
}

export default function BuilderPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replaceAll("<", "\\u003c") }}
      />
      <AnnouncementBar />
      <MapIconPreloads />
      <Suspense fallback={<main className="min-h-screen bg-background" />}>
        <BuilderClient />
      </Suspense>
    </>
  )
}
