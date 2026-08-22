import type { Metadata } from "next"

export const SITE_METADATA = {
  name: "FACEIT Widget",
  url: "https://faceitwidget.com",
  title: "FACEIT Widget for OBS – Live CS2 ELO & Stats",
  description:
    "Create a free FACEIT widget for OBS or Streamlabs. Show live CS2 ELO, level, ranking, K/D, and recent matches with one browser-source URL.",
} as const

export const SOCIAL_IMAGE = {
  url: "/opengraph-image?v=2",
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

export const INDEXABLE_PATHS = [
  SITE_PATHS.home,
  SITE_PATHS.faceitWidgetObsGuide,
  SITE_PATHS.liveFaceitStatsGuide,
  SITE_PATHS.contact,
  SITE_PATHS.privacy,
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
