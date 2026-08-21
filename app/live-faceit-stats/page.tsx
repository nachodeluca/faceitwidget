import type { Metadata } from "next"
import Link from "next/link"

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
      description="The overlay watches for completed CS2 matches and refreshes the displayed stats without reloading the OBS browser source."
      path={path}
    >
      <h2>What updates</h2>
      <p>
        The widget can show FACEIT ELO, skill level, leaderboard position, country rank, lifetime K/D, today&apos;s record, and averages from the latest 30 completed matches.
      </p>

      <h2>When a match finishes</h2>
      <p>
        An open widget checks the latest FACEIT match every 30 seconds. When a new match appears, it reloads the player statistics and animates changed values. If FACEIT has not finished processing the match, the service retries with increasing delays.
      </p>
      <p>
        The usual target is an update within 30 seconds after FACEIT publishes the result. Processing time inside FACEIT can add extra delay.
      </p>

      <h2>Shared cache</h2>
      <p>
        Viewers displaying the same player share one cached snapshot and one update check. This reduces traffic to FACEIT and keeps the free service usable during streams.
      </p>

      <h2>Failures and old data</h2>
      <p>
        If FACEIT is unavailable or rate limited, the overlay keeps the last valid snapshot instead of disappearing. It reconnects automatically and replaces the old values when the service recovers.
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
