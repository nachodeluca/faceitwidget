import type { Metadata } from "next"

export const SITE_METADATA = {
  name: "FACEIT Widget",
  url: "https://faceitwidget.com",
  title: "FACEIT Widget | CS2 FACEIT Stats for OBS & Streamers",
  description:
    "Create a free FACEIT Widget for OBS and Streamlabs. Show live CS2 ELO, level, rank, K/D, and recent matches in a browser source with no plugin or login.",
} as const

export const SITE_LAST_MODIFIED = "2026-09-20"

export const SITE_AUTHOR = {
  name: "Nacho",
  url: "https://github.com/nachodeluca",
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
  about: "/about/",
  contact: "/contact/",
  privacy: "/privacy/",
} as const

export const APP_PATHS = {
  builder: "/builder/",
  widget: "/widget/",
} as const

export const INDEXABLE_PATHS = [
  SITE_PATHS.home,
  APP_PATHS.builder,
  SITE_PATHS.faceitWidgetObsGuide,
  SITE_PATHS.liveFaceitStatsGuide,
  SITE_PATHS.about,
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
