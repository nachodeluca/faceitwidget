import type { Metadata } from "next"
import Link from "next/link"

import { GUIDE_IMAGES, GuideImage } from "@/components/guides/guide-image"
import { GuidePage } from "@/components/guides/guide-page"
import { createLandingMetadata, SITE_PATHS } from "@/lib/site-metadata"

const path = SITE_PATHS.faceitWidgetObsGuide
const heading = "How to Add a FACEIT Widget to OBS & Streamlabs"
const metadataTitle = heading
const description =
  "Step-by-step guide to adding a free FACEIT widget to OBS Studio or Streamlabs Desktop. Show live CS2 ELO, rank, and K/D with no plugin or login."

export const metadata: Metadata = {
  ...createLandingMetadata({ title: metadataTitle, description, path }),
  title: { absolute: metadataTitle },
}

export default function FaceitWidgetObsGuide() {
  return (
    <GuidePage
      title={heading}
      description="Create a free live ELO and stats overlay for OBS Studio or Streamlabs Desktop. Add it as a Browser source with no plugin or player login."
      path={path}
    >
      <h2>Set up the widget</h2>
      <p>Follow these steps to add a FACEIT widget to OBS Studio or Streamlabs Desktop.</p>

      <h3>Step 1: Enter the FACEIT nickname</h3>
      <p>Open the builder and enter the exact nickname from the FACEIT profile.</p>

      <h3>Step 2: Choose a layout and stats</h3>
      <p>Pick a preset and keep only the stats you want viewers to see.</p>
      <GuideImage
        image={GUIDE_IMAGES.builderSettings}
        alt="FACEIT Widget builder settings with the Rank and ELO preset selected"
        caption="Choose a preset and keep only the fields you want viewers to see."
        compact
      />

      <h3>Step 3: Set a transparent background</h3>
      <p>
        Select <strong>Transparent</strong> to keep the game visible behind the stats. The border
        and shadow stay disabled, so you do not need custom CSS in OBS or Streamlabs.
      </p>
      <GuideImage
        image={GUIDE_IMAGES.widgetOverlay}
        alt="FACEIT rank and ELO widget displayed transparently over Counter-Strike 2 in OBS"
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

      <h3>Step 5: Add a Browser source in OBS or Streamlabs</h3>
      <p>
        In OBS Studio, add a <strong>Browser</strong> source to the scene. In Streamlabs Desktop,
        open the Sources panel in the editor and click <strong>+</strong>. Choose{" "}
        <strong>Browser Source</strong>, name it, and click <strong>Add Source</strong>.
      </p>
      <GuideImage
        image={GUIDE_IMAGES.addBrowserSource}
        alt="OBS Add Source dialog with Browser selected"
        caption="In OBS Studio, add a Browser source to the scene where the overlay should appear."
      />

      <h3>Step 6: Paste the URL and set the source size</h3>
      <p>
        Paste the copied URL and start with a width of 800 and a height of 300. Adjust the size or
        crop empty space if needed.
      </p>
      <GuideImage
        image={GUIDE_IMAGES.browserSettings}
        alt="OBS Browser source properties with a FACEIT Widget URL and an 800 by 300 canvas"
        caption="Paste the widget URL and start with an 800 x 300 Browser source."
      />

      <h3>Step 7: Position the overlay</h3>
      <p>
        Move the source into place and scale it without stretching. Keep the Browser source active
        if you want its values to update outside the current scene.
      </p>
      <p>
        Read the <Link href={SITE_PATHS.liveFaceitStatsGuide}>live stats guide</Link> to see what
        appears after a match. Prefer Streamlabs Desktop? Follow the{" "}
        <Link href={SITE_PATHS.faceitWidgetStreamlabsGuide}>Streamlabs setup guide</Link>.
      </p>

      <h2>Troubleshoot the widget</h2>

      <h3>The widget shows the wrong player</h3>
      <p>Check that the nickname matches the FACEIT profile exactly.</p>

      <h3>The overlay still shows an old URL</h3>
      <p>Refresh the Browser source after replacing its URL.</p>

      <h3>The latest match stats are missing</h3>
      <p>Wait for FACEIT to publish the finished match, then refresh the Browser source.</p>
    </GuidePage>
  )
}
