import type { Metadata } from "next"
import Link from "next/link"

import { GuideImage, GUIDE_IMAGES } from "@/components/guides/guide-image"
import { GuidePage } from "@/components/guides/guide-page"
import { createLandingMetadata, SITE_METADATA, SITE_PATHS } from "@/lib/site-metadata"

const path = SITE_PATHS.faceitWidgetStreamlabsGuide
const title = "FACEIT Widget for Streamlabs - Live ELO & Stats Overlay"
const description =
  "Add a free FACEIT CS2 ELO and stats overlay to Streamlabs Desktop. Use a Browser Source with no plugin or player login."

export const metadata: Metadata = {
  ...createLandingMetadata({ title, description, path }),
  title: { absolute: title },
}

const faqs = [
  {
    question: "Does FACEIT Widget work with Streamlabs Desktop?",
    answer:
      "Yes. Copy the generated URL from the builder and add it as a Browser Source in Streamlabs Desktop. No plugin or FACEIT login is required.",
  },
  {
    question: "What size should the Browser Source use?",
    answer:
      "Start with a width of 800 and a height of 300, then crop empty space or scale the source so the overlay fits your scene.",
  },
  {
    question: "The overlay still shows an old layout",
    answer:
      "After you change the widget URL, refresh or recreate the Browser Source so Streamlabs loads the latest link.",
  },
  {
    question: "Latest match stats are missing",
    answer:
      "Wait for FACEIT to publish the finished match, then allow up to about two minutes for the next widget refresh while the Browser Source stays open.",
  },
] as const

const structuredFaq = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "@id": `${SITE_METADATA.url}${path}#faq`,
  url: `${SITE_METADATA.url}${path}`,
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
}

export default function FaceitWidgetStreamlabsGuide() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredFaq).replaceAll("<", "\\u003c") }}
      />
      <GuidePage
        title={title}
        description="Create a free live ELO and stats overlay for Streamlabs Desktop. Add it as a Browser Source with no plugin or player login."
        path={path}
      >
        <h2>Set up FACEIT Widget in Streamlabs</h2>
        <p>
          Follow these steps to add a FACEIT stats overlay to Streamlabs Desktop. The same browser-source URL also works in{" "}
          <Link href={SITE_PATHS.faceitWidgetObsGuide}>OBS Studio</Link>.
        </p>

        <h3>Step 1: Enter the FACEIT nickname</h3>
        <p>Open the builder and enter the exact nickname from the FACEIT profile.</p>

        <h3>Step 2: Choose a layout and stats</h3>
        <p>
          Pick a <Link href={SITE_PATHS.presets}>preset</Link> and keep only the stats you want viewers to see.
        </p>
        <GuideImage
          image={GUIDE_IMAGES.builderSettings}
          alt="FACEIT Widget builder settings with the Rank and ELO preset selected"
          caption="Choose a preset and keep only the fields you want viewers to see."
          compact
        />

        <h3>Step 3: Set a transparent background</h3>
        <p>
          Select <strong>Transparent</strong> to keep the game visible behind the stats. The border and shadow stay
          disabled, so you do not need custom CSS in Streamlabs.
        </p>
        <GuideImage
          image={GUIDE_IMAGES.widgetOverlay}
          alt="FACEIT rank and ELO widget displayed transparently over Counter-Strike 2"
          caption="The game remains visible through the widget while the stats stay readable."
        />

        <h3>Step 4: Copy the widget URL</h3>
        <p>
          When the preview is ready, select <strong>Copy URL</strong>.
        </p>
        <GuideImage
          image={GUIDE_IMAGES.copyUrl}
          alt="The Copy URL dialog showing the generated browser source link"
          caption="Copy the generated URL after the preview matches your stream layout."
        />

        <h3>Step 5: Add a Browser Source in Streamlabs Desktop</h3>
        <p>
          In Streamlabs Desktop, open the <strong>Sources</strong> panel in the editor and click <strong>+</strong>.
          Choose <strong>Browser Source</strong>, name it, and click <strong>Add Source</strong>.
        </p>
        <GuideImage
          image={GUIDE_IMAGES.addBrowserSource}
          alt="Add Source dialog with Browser selected"
          caption="Add a Browser Source to the scene where the overlay should appear. Streamlabs Desktop uses the same Browser Source type as OBS."
        />

        <h3>Step 6: Paste the URL and set the source size</h3>
        <p>
          Paste the copied URL and start with a width of 800 and a height of 300. Adjust the size or crop empty space if
          needed.
        </p>
        <GuideImage
          image={GUIDE_IMAGES.browserSettings}
          alt="Browser source properties with a FACEIT Widget URL and an 800 by 300 canvas"
          caption="Paste the widget URL and start with an 800 x 300 Browser Source."
        />

        <h3>Step 7: Position the overlay</h3>
        <p>
          Move the source into place and scale it without stretching. Keep the Browser Source active if you want its
          values to update outside the current scene.
        </p>
        <p>
          Read the <Link href={SITE_PATHS.liveFaceitStatsGuide}>live stats guide</Link> to see what appears after a
          match.
        </p>

        <h2>Streamlabs FAQ</h2>
        {faqs.map((faq) => (
          <div key={faq.question}>
            <h3>{faq.question}</h3>
            <p>{faq.answer}</p>
          </div>
        ))}

        <h2>Also using OBS?</h2>
        <p>
          The same URL works in OBS Studio. Follow the <Link href={SITE_PATHS.faceitWidgetObsGuide}>OBS setup guide</Link>{" "}
          for OBS-specific Browser source steps.
        </p>
      </GuidePage>
    </>
  )
}
