import type { Metadata } from "next"
import Link from "next/link"

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
        <li>Select <strong>No background</strong> if the game should remain visible behind the overlay.</li>
        <li>Use <strong>Copy URL</strong> when the preview is ready.</li>
      </ol>

      <h2>Add it to OBS</h2>
      <ol>
        <li>Create a new <strong>Browser</strong> source in the OBS scene.</li>
        <li>Paste the copied widget URL into the URL field.</li>
        <li>Start with a width of 800 and a height of 300, then crop the empty area if needed.</li>
        <li>Position and scale the source without stretching it.</li>
      </ol>
      <p>
        Keep the browser source active if you want its values to update while it is outside the current scene. Read the{" "}
        <Link href={SITE_PATHS.liveFaceitStatsGuide}>live stats guide</Link> if you want to know what appears after a match.
      </p>

      <h2>Transparent overlays</h2>
      <p>
        The No background option removes the widget surface, border, and shadow. Text and rank marks remain visible over the game. You do not need custom OBS CSS.
      </p>

      <h2>If the widget does not update</h2>
      <ul>
        <li>Check that the nickname matches the FACEIT profile.</li>
        <li>Refresh the browser source after replacing its URL.</li>
        <li>Wait for FACEIT to publish the finished match.</li>
      </ul>
    </GuidePage>
  )
}
