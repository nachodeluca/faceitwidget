import type { Metadata } from "next"

import { SitePage } from "@/components/site/site-page"
import { SITE_LINKS } from "@/lib/site-links"
import { createLandingMetadata, SITE_AUTHOR, SITE_PATHS } from "@/lib/site-metadata"

const title = "About the FACEIT Widget project"
const description = "Learn who maintains FACEIT Widget, how the open-source project works, and what data it uses for OBS overlays."

export const metadata: Metadata = createLandingMetadata({ title, description, path: SITE_PATHS.about })

export default function AboutPage() {
  return (
    <SitePage
      title={title}
      description={description}
      path={SITE_PATHS.about}
      showBuilderCta
      pageType="AboutPage"
    >
      <h2>What FACEIT Widget does</h2>
      <p>
        FACEIT Widget is a free, open-source web application for creating FACEIT CS2 statistics overlays. Streamers can use the generated page as a Browser source in OBS Studio or Streamlabs Desktop to show public player information such as ELO, FACEIT level, Challenger status, world rank, country rank, K/D, and recent match results.
      </p>
      <p>
        The project is designed to stay simple: choose a preset, select the fields that belong in your scene, tune the visual style, and copy one URL. It does not require a desktop plugin or a FACEIT password, and it is not an account-management or matchmaking tool.
      </p>

      <h2>How the project works</h2>
      <ol>
        <li>You enter a public FACEIT nickname in the <a href="/builder/">widget builder</a>.</li>
        <li>The service requests the public statistics needed for the selected layout.</li>
        <li>The browser-source page renders the overlay and checks for changed values about every two minutes while it is open.</li>
      </ol>
      <p>
        A completed match can take a little time to appear because the result must first be published by FACEIT. The <a href={SITE_PATHS.liveFaceitStatsGuide}>live stats guide</a> explains what the refresh can update, and the <a href={SITE_PATHS.faceitWidgetObsGuide}>OBS setup guide</a> covers the Browser source configuration.
      </p>

      <h2>Maintainer and source code</h2>
      <p>
        FACEIT Widget is maintained by <a href={SITE_AUTHOR.url} target="_blank" rel="noreferrer">{SITE_AUTHOR.name}</a>. The source code, issue tracker, setup notes, and contribution history are available in the public <a href={SITE_LINKS.github} target="_blank" rel="noreferrer">GitHub repository</a>. Technical questions, bug reports, and feature requests should be opened there so they can be answered and searched by other streamers.
      </p>

      <h2>Privacy and affiliation</h2>
      <p>
        The widget uses public FACEIT statistics for the nickname requested. It does not ask for a password, OAuth token, private account permission, or payment details. Hosting and security providers may process limited technical request data needed to deliver the service. See the <a href={SITE_PATHS.privacy}>privacy page</a> for the website analytics and data details.
      </p>
      <p>
        This is an independent community project. FACEIT Widget is not affiliated with, endorsed by, or operated by FACEIT. For account, matchmaking, moderation, or platform support, contact FACEIT directly. For questions about this project, use the <a href={SITE_PATHS.contact}>contact page</a>.
      </p>
    </SitePage>
  )
}
