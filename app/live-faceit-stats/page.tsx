import type { Metadata } from "next"
import Link from "next/link"

import { GUIDE_IMAGES, GuideImage } from "@/components/guides/guide-image"
import { GuidePage } from "@/components/guides/guide-page"
import { createLandingMetadata, SITE_PATHS } from "@/lib/site-metadata"

const path = SITE_PATHS.liveFaceitStatsGuide
const title = "FACEIT Stats Overlay - Live ELO, Rank & K/D in OBS"
const description =
  "Learn when FACEIT Widget refreshes CS2 ELO, rank, K/D, and recent match stats in OBS, and what to check if a completed match is not visible yet."

export const metadata: Metadata = {
  ...createLandingMetadata({ title, description, path }),
  title: { absolute: title },
}

export default function LiveFaceitStatsGuide() {
  return (
    <GuidePage
      title={title}
      description="The overlay keeps your selected FACEIT statistics visible and checks for updated values about every two minutes while your OBS browser source is open."
      path={path}
    >
      <h2>What updates</h2>
      <p>
        The widget can show FACEIT ELO, skill level, leaderboard position, country rank, lifetime
        K/D, today&apos;s record, and averages from the latest 30 completed matches.
      </p>
      <GuideImage
        image={GUIDE_IMAGES.liveStats}
        alt="Rich Profile preset showing FACEIT ELO, country rank, K/D, and statistics from the latest 30 matches"
        caption="Rich Profile combines rank data with recent match averages in one overlay."
      />

      <h2>When a match finishes</h2>
      <p>
        When FACEIT publishes a finished match, the widget checks for the relevant values about
        every two minutes, then animates the change while the browser source stays open.
      </p>
      <p>
        A match may take a little time to appear after you leave the server. This depends on when
        FACEIT makes the result available and the next widget refresh.
      </p>

      <h2>If the widget does not update</h2>
      <p>
        Check the nickname, make sure the result is visible on FACEIT, and allow up to two minutes
        for the next refresh. Refresh the OBS browser source if you recently replaced the widget
        URL. The last available values remain visible until newer values are ready.
      </p>

      <h2>Privacy</h2>
      <p>
        The widget reads public FACEIT statistics. It does not ask for a FACEIT password, OAuth
        consent, or access to the player&apos;s account.
      </p>

      <h2>Use the widget on stream</h2>
      <p>
        Follow the <Link href={SITE_PATHS.faceitWidgetObsGuide}>OBS setup guide</Link> or the{" "}
        <Link href={SITE_PATHS.faceitWidgetStreamlabsGuide}>Streamlabs setup guide</Link> to add the
        generated URL as a browser source. Browse the <Link href={SITE_PATHS.presets}>presets</Link>{" "}
        if you want a different layout.
      </p>
    </GuidePage>
  )
}
