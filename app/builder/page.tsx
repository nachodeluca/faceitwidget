import type { Metadata } from "next"
import { Suspense } from "react"

import { MapIconPreloads } from "@/components/widget/map-icon-preloads"
import { AnnouncementBar } from "@/components/site/announcement-bar"
import { absoluteSiteUrl, APP_PATHS, createLandingMetadata, SITE_LAST_MODIFIED, SITE_METADATA } from "@/lib/site-metadata"

import { BuilderClient } from "./builder-client"

// Rendered as "Free CS2 Overlay Builder for OBS & Streamlabs | FACEIT Widget" via the root title template.
const title = "Free CS2 Overlay Builder for OBS & Streamlabs"
const description =
  "Build a free FACEIT CS2 stats overlay for OBS or Streamlabs. Customize live ELO, rank, K/D, recent matches and colors, then copy the Browser source URL."
const applicationName = "FACEIT Widget Builder"
const builderUrl = absoluteSiteUrl(APP_PATHS.builder)
const siteUrl = `${SITE_METADATA.url}/`
const webApplicationId = `${builderUrl}#webapplication`
const webPageId = `${builderUrl}#webpage`
const breadcrumbId = `${builderUrl}#breadcrumb`
// Same @id values as the home page graph (app/page.tsx), so the builder is linked to the site-wide entities.
const homeApplicationId = `${SITE_METADATA.url}/#application`
const websiteId = `${SITE_METADATA.url}/#website`
const organizationId = `${SITE_METADATA.url}/#organization`

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": webApplicationId,
      name: applicationName,
      alternateName: "FACEIT CS2 stats overlay builder for OBS and Streamlabs",
      url: builderUrl,
      description,
      // Matches the home page WebApplication so the two nodes do not declare conflicting categories.
      applicationCategory: "GameApplication",
      applicationSubCategory: "Stream overlay builder",
      operatingSystem: "Any",
      browserRequirements: "Requires JavaScript and a modern browser.",
      isAccessibleForFree: true,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      featureList: [
        "Live FACEIT ELO, level, and rank",
        "CS2 K/D and recent match stats",
        "Custom colors, layout, and animation",
        "Transparent Browser source URL for OBS Studio and Streamlabs Desktop",
        "No plugin or login required",
      ],
      isPartOf: { "@id": homeApplicationId },
      publisher: { "@id": organizationId },
      mainEntityOfPage: { "@id": webPageId },
      dateModified: SITE_LAST_MODIFIED,
    },
    {
      "@type": "WebPage",
      "@id": webPageId,
      url: builderUrl,
      name: title,
      description,
      inLanguage: "en",
      isPartOf: { "@id": websiteId },
      about: { "@id": homeApplicationId },
      mainEntity: { "@id": webApplicationId },
      breadcrumb: { "@id": breadcrumbId },
      publisher: { "@id": organizationId },
      dateModified: SITE_LAST_MODIFIED,
    },
    {
      "@type": "BreadcrumbList",
      "@id": breadcrumbId,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
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
