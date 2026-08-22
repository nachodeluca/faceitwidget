import type { Metadata } from "next"

import { Hero } from "@/components/home/hero"
import { SiteFooter } from "@/components/home/site-footer"
import { SITE_LINKS } from "@/lib/site-links"
import { SITE_METADATA, SITE_PATHS } from "@/lib/site-metadata"

const examplePlayer = "donk666"

export const metadata: Metadata = {
  alternates: { canonical: SITE_PATHS.home },
}

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_METADATA.url}/#website`,
      url: `${SITE_METADATA.url}/`,
      name: SITE_METADATA.name,
      alternateName: ["faceitwidget.com", "FACEIT Widget for OBS"],
      description: SITE_METADATA.description,
      inLanguage: "en",
      publisher: { "@id": `${SITE_METADATA.url}/#organization` },
    },
    {
      "@type": "Organization",
      "@id": `${SITE_METADATA.url}/#organization`,
      name: SITE_METADATA.name,
      url: `${SITE_METADATA.url}/`,
      logo: `${SITE_METADATA.url}/logo.svg`,
      description: SITE_METADATA.description,
      alternateName: "FACEIT Widget for OBS",
      sameAs: [SITE_LINKS.github],
      knowsAbout: ["FACEIT CS2 statistics", "OBS browser-source overlays"],
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "Technical support",
        url: `${SITE_LINKS.github}/issues`,
      },
    },
    {
      "@type": "WebApplication",
      "@id": `${SITE_METADATA.url}/#application`,
      name: SITE_METADATA.name,
      url: `${SITE_METADATA.url}/`,
      description: SITE_METADATA.description,
      applicationCategory: "GameApplication",
      operatingSystem: "Any",
      isAccessibleForFree: true,
      brand: { "@id": `${SITE_METADATA.url}/#organization` },
      isPartOf: { "@id": `${SITE_METADATA.url}/#website` },
      publisher: { "@id": `${SITE_METADATA.url}/#organization` },
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
    },
  ],
}

export default function Home() {
  return (
    <main className="relative min-h-svh overflow-hidden bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replaceAll("<", "\\u003c") }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_25%_15%,rgb(255_255_255_/_10%),transparent_30%),radial-gradient(circle_at_78%_58%,rgb(255_255_255_/_3%),transparent_34%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-30 [background-image:linear-gradient(to_right,rgb(255_255_255_/_4%)_1px,transparent_1px),linear-gradient(to_bottom,rgb(255_255_255_/_4%)_1px,transparent_1px)] [background-size:92px_92px] [mask-image:linear-gradient(to_bottom,black,transparent_72%)]" />
      <Hero player={examplePlayer} />
      <SiteFooter />
    </main>
  )
}
