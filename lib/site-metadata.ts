import type { Metadata } from "next"

export const SITE_METADATA = {
  name: "FACEIT Widget",
  url: "https://faceitwidget.com",
  title: "FACEIT Widget for OBS | Live CS2 Stats Overlay",
  description:
    "Create a free FACEIT widget for OBS with live CS2 ELO, level, ranking, and match stats.",
} as const

export const SOCIAL_IMAGE = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: "FACEIT Widget for OBS",
} as const

export const SITE_PATHS = {
  home: "/",
  faceitWidgetObsGuide: "/faceit-widget-obs/",
  liveFaceitStatsGuide: "/live-faceit-stats/",
  contact: "/contact/",
  privacy: "/privacy/",
} as const

export const INDEXABLE_ROUTES = [
  { path: SITE_PATHS.home, changeFrequency: "monthly", priority: 1 },
  { path: SITE_PATHS.faceitWidgetObsGuide, changeFrequency: "monthly", priority: 0.8 },
  { path: SITE_PATHS.liveFaceitStatsGuide, changeFrequency: "monthly", priority: 0.8 },
  { path: SITE_PATHS.contact, changeFrequency: "yearly", priority: 0.3 },
  { path: SITE_PATHS.privacy, changeFrequency: "yearly", priority: 0.3 },
] as const

export function absoluteSiteUrl(path: string) {
  return new URL(path, SITE_METADATA.url).toString()
}

type LandingMetadata = {
  title: string
  description: string
  path: string
}

export function createLandingMetadata({ title, description, path }: LandingMetadata): Metadata {
  const canonical = absoluteSiteUrl(path)
  const socialTitle = `${title} | ${SITE_METADATA.name}`

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      siteName: SITE_METADATA.name,
      title: socialTitle,
      description,
      url: canonical,
      images: [SOCIAL_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: [SOCIAL_IMAGE.url],
    },
  }
}
