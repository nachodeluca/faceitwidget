import type { Metadata } from "next"

import { SitePage } from "@/components/site/site-page"
import { SITE_LINKS } from "@/lib/site-links"
import { createLandingMetadata, SITE_PATHS } from "@/lib/site-metadata"

const title = "Privacy at FACEIT Widget"
const description = "What FACEIT Widget receives, what website analytics are used, and what the widget does not collect."

export const metadata: Metadata = createLandingMetadata({ title, description, path: SITE_PATHS.privacy })

export default function PrivacyPage() {
  return (
    <SitePage title={title} description={description} path={SITE_PATHS.privacy}>
      <h2>What the widget uses</h2>
      <p>
        The widget uses public FACEIT profile and CS2 statistics to render the layout selected in the builder. The service may
        receive a FACEIT nickname or player ID, a timezone, and the selected widget configuration so it can display the requested
        public statistics in the browser source.
      </p>
      <p>
        FACEIT Widget does not ask for a FACEIT password, OAuth token, private account permission, or payment details. It does not
        modify a FACEIT profile. Do not put secrets or private information in a widget URL, GitHub issue, or feedback message.
      </p>

      <h2>Website analytics</h2>
      <p>
        The public website uses Google Analytics 4 to measure aggregate traffic and understand which pages and referral links are
        useful. The tracked events cover page views, opening the builder, and selecting a preset. The `/widget/` browser-source
        route is excluded so an OBS source does not look like a new website visit. Campaign parameters such as UTM values are
        removed from the address bar after they are recorded.
      </p>

      <h2>Technical data</h2>
      <p>
        Hosting and security providers may process limited technical request data needed to deliver and protect the site. This
        project does not use that information to build profiles of players or identify people. It does not contain a FACEIT
        password or account access token.
      </p>

      <h2>Questions and requests</h2>
      <p>
        This is an independent open-source project and is not affiliated with FACEIT. For questions about the site or a request to
        correct project content, use the <a href={SITE_LINKS.github}>GitHub repository</a>. FACEIT account and platform requests
        should go to FACEIT support. See the <a href={SITE_PATHS.contact}>contact page</a> for issue templates and the information
        that helps reproduce a widget problem.
      </p>
    </SitePage>
  )
}
