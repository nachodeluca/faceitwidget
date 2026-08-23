import type { Metadata } from "next"
import Link from "next/link"

import { GuideImage, GUIDE_IMAGES } from "@/components/guides/guide-image"
import { GuidePage } from "@/components/guides/guide-page"
import { createLandingMetadata, SITE_PATHS } from "@/lib/site-metadata"

const path = SITE_PATHS.faceitWidgetObsGuide
const title = "How to add a FACEIT widget to OBS"
const description =
  "Add a free FACEIT stats widget to OBS as a browser source, with transparent backgrounds and live CS2 updates."

export const metadata: Metadata = createLandingMetadata({ title, description, path })

export default function FaceitWidgetObsGuide() {
  return (
    <GuidePage
      title={title}
      description="Build an overlay, copy its URL, and add it to OBS as a browser source. No plugin or player login is required."
      path={path}
    >
      <h2>Create the widget</h2>
      <ol>
        <li>Open the builder and enter the exact FACEIT nickname.</li>
        <li>Choose a layout and keep only the stats you want on stream.</li>
        <li>Select <strong>Transparent</strong> if the game should remain visible behind the overlay.</li>
        <li>Use <strong>Copy URL</strong> when the preview is ready.</li>
      </ol>
      <GuideImage
        image={GUIDE_IMAGES.builderSettings}
        alt="FACEIT Widget builder settings with the Rank and ELO preset selected"
        caption="Choose a preset and keep only the fields you want viewers to see."
        compact
      />
      <GuideImage
        image={GUIDE_IMAGES.copyUrl}
        alt="Use your widget dialog showing the generated Browser source URL"
        caption="Copy the generated URL after the preview matches your stream layout."
      />

      <h2>Add it to OBS</h2>
      <ol>
        <li>Create a new <strong>Browser</strong> source in the OBS scene.</li>
        <li>Paste the copied widget URL into the URL field.</li>
        <li>Start with a width of 800 and a height of 300, then crop the empty area if needed.</li>
        <li>Position and scale the source without stretching it.</li>
      </ol>
      <GuideImage
        image={GUIDE_IMAGES.addBrowserSource}
        alt="OBS Add Source dialog with Browser selected"
        caption="Add a Browser source to the scene where the overlay should appear."
      />
      <GuideImage
        image={GUIDE_IMAGES.browserSettings}
        alt="OBS Browser source properties with a FACEIT Widget URL and an 800 by 300 canvas"
        caption="Paste the widget URL and start with an 800 × 300 Browser source."
      />
      <p>
        Keep the browser source active if you want its values to update while it is outside the current scene. Read the{" "}
        <Link href={SITE_PATHS.liveFaceitStatsGuide}>live stats guide</Link> if you want to know what appears after a match.
      </p>

      <h2>Transparent overlays</h2>
      <p>
        The Transparent option keeps the game visible through a subtle black layer while preserving contrast for the stats. The border and shadow stay disabled, so you do not need custom OBS CSS.
      </p>
      <GuideImage
        image={GUIDE_IMAGES.widgetOverlay}
        alt="FACEIT rank and ELO widget displayed transparently over Counter-Strike 2 in OBS"
        caption="The game remains visible through the widget while the stats stay readable."
      />

      <h2>If the widget does not update</h2>
      <ul>
        <li>Check that the nickname matches the FACEIT profile.</li>
        <li>Refresh the browser source after replacing its URL.</li>
        <li>Wait for FACEIT to publish the finished match.</li>
      </ul>
    </GuidePage>
  )
}
