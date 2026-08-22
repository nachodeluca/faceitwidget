import type { Metadata } from "next"
import Link from "next/link"

import { GuideImage, GUIDE_IMAGES } from "@/components/guides/guide-image"
import { GuidePage } from "@/components/guides/guide-page"
import { createLandingMetadata, SITE_PATHS } from "@/lib/site-metadata"

const path = SITE_PATHS.liveFaceitStatsGuide
const title = "How live FACEIT stats update"
const description =
  "Learn when the FACEIT overlay updates ELO, ranking, K/D, today stats, and the latest 30 CS2 matches."

export const metadata: Metadata = createLandingMetadata({ title, description, path })

export default function LiveFaceitStatsGuide() {
  return (
    <GuidePage
      title={title}
      description="The overlay keeps your selected FACEIT statistics visible while your OBS browser source is open."
      path={path}
    >
      <h2>What updates</h2>
      <p>
        The widget can show FACEIT ELO, skill level, leaderboard position, country rank, lifetime K/D, today&apos;s record, and averages from the latest 30 completed matches.
      </p>
      <GuideImage
        image={GUIDE_IMAGES.liveStats}
        alt="Rich Profile preset showing FACEIT ELO, country rank, K/D, and statistics from the latest 30 matches"
        caption="Rich Profile combines rank data with recent match averages in one overlay."
      />

      <h2>When a match finishes</h2>
      <p>
        When FACEIT publishes a finished match, the widget updates the relevant values and animates the change while the browser source stays open.
      </p>
      <p>
        A match may take a little time to appear after you leave the server. This depends on when FACEIT makes the result available.
      </p>

      <h2>If the widget does not update</h2>
      <p>
        Check the nickname, make sure the result is visible on FACEIT, and refresh the OBS browser source if you recently replaced the widget URL. The last available values remain visible until newer values are ready.
      </p>

      <h2>Privacy</h2>
      <p>
        The widget reads public FACEIT statistics. It does not ask for a FACEIT password, OAuth consent, or access to the player&apos;s account.
      </p>

      <h2>Use the widget on stream</h2>
      <p>
        Follow the <Link href={SITE_PATHS.faceitWidgetObsGuide}>FACEIT Widget setup for OBS</Link> to add the generated URL as a browser source.
      </p>
    </GuidePage>
  )
}
