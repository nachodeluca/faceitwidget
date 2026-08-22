const MARKDOWN_DOCUMENTS = new Map<string, string>([
  [
    "/",
    `# FACEIT Widget

FACEIT Widget is a free open-source browser-source overlay for public FACEIT CS2 statistics in OBS and Streamlabs.

## What it does

Enter a FACEIT nickname, choose a layout, and copy a URL into an OBS Browser source. The builder can show ELO, FACEIT level or Challenger rank, country and world rankings, K/D, recent form, session results, and profile details. It also supports no-background overlays, colors, scale, borders, map backgrounds, and rotating statistics on larger presets.

The widget reads public FACEIT data. It does not ask for a FACEIT password, OAuth token, or private account permission. When FACEIT publishes a completed match, changed values animate into the open widget.

## Links

- [Widget builder](https://faceitwidget.com/builder/): create and configure an overlay.
- [OBS setup](https://faceitwidget.com/faceit-widget-obs/): add the URL as a Browser source.
- [Live stats](https://faceitwidget.com/live-faceit-stats/): understand what appears after a match.
- [Contact](https://faceitwidget.com/contact/): GitHub issue templates and support channel.
- [Privacy](https://faceitwidget.com/privacy/): analytics and service data details.
`,
  ],
  [
    "/faceit-widget-obs/",
    `# How to add a FACEIT widget to OBS

FACEIT Widget creates a public URL that OBS can display as a Browser source. No plugin or FACEIT login is required.

## Create the widget

Open the [widget builder](https://faceitwidget.com/builder/) and enter the exact FACEIT nickname. Choose a preset, keep the fields that belong on stream, and use the preview to check the size. Select No background when the game should remain visible behind the text. Copy the URL when the layout is ready.

![FACEIT Widget builder settings](https://faceitwidget.com/guides/faceit-widget-builder-settings.png)

![Generated Browser source URL](https://faceitwidget.com/guides/faceit-widget-copy-url.png)

## Add it to OBS

Create a Browser source in the OBS scene and paste the generated URL. Start with a width of 800 and a height of 300, then adjust the source to the selected layout. Do not stretch the source. Keep the Browser source active if it should receive updated values outside the current scene.

![Add a Browser source in OBS](https://faceitwidget.com/guides/obs-add-browser-source.png)

![FACEIT Widget Browser source settings](https://faceitwidget.com/guides/obs-browser-source-settings.png)

![FACEIT Widget displayed over Counter-Strike 2](https://faceitwidget.com/guides/obs-widget-overlay.png)

## If it does not update

Check the nickname, refresh the Browser source after replacing its URL, and wait for FACEIT to publish the finished match. A result may take a little time to become available on FACEIT.

Read the [live stats guide](https://faceitwidget.com/live-faceit-stats/) to understand what appears after a match.
`,
  ],
  [
    "/live-faceit-stats/",
    `# How live FACEIT stats update

An open FACEIT Widget can update public CS2 data without reloading the OBS Browser source.

## What updates

Depending on the selected preset and fields, the overlay can show FACEIT ELO, skill level, Challenger rank, leaderboard position, country rank, lifetime K/D, today's record, and averages from the latest 30 completed matches.

![Rich Profile preset with recent FACEIT statistics](https://faceitwidget.com/guides/live-stats-rich-profile.png)

## When a match finishes

When FACEIT publishes a finished match, the widget updates the relevant values and animates the change. A result may take a little time to appear after you leave the server.

## If an update is missing

Check the nickname, make sure the result is visible on FACEIT, and refresh the Browser source if you recently replaced the widget URL. The last available values remain visible until newer values are ready.

The widget reads public statistics only. It does not request a password, OAuth consent, or access to a player account. See the [OBS setup guide](https://faceitwidget.com/faceit-widget-obs/) to add the generated URL.
`,
  ],
  [
    "/contact/",
    `# Contact FACEIT Widget

FACEIT Widget is maintained as an open-source community project. The [GitHub repository](https://github.com/nachodeluca/faceitwidget) is the official contact channel for technical questions, bug reports, and feature requests.

For a broken widget, use the [bug report template](https://github.com/nachodeluca/faceitwidget/issues/new?template=bug_report.yml). Include the browser or streaming software version, widget URL, preset name, the FACEIT nickname if it is safe to share, and the exact behavior you expected. Never include passwords, API keys, private tokens, or another person's account information.

Feature requests belong in the [feedback template](https://github.com/nachodeluca/faceitwidget/issues/new?template=feedback.yml). Explain the stream setup, the preset being used, and the result you want viewers to see. Screenshots are useful when they show the widget itself.

Read the [OBS setup guide](https://faceitwidget.com/faceit-widget-obs/) for Browser source settings and the [live stats guide](https://faceitwidget.com/live-faceit-stats/) when a completed match is not visible yet. This project does not provide official FACEIT support.
`,
  ],
  [
    "/privacy/",
    `# Privacy at FACEIT Widget

The widget uses public FACEIT profile and CS2 statistics to render the selected layout. The service may receive a FACEIT nickname or player ID, a timezone, and the widget configuration so it can display the requested public statistics in the Browser source.

FACEIT Widget does not ask for a FACEIT password, OAuth token, private account permission, or payment details. It does not modify a FACEIT profile. Do not put secrets or private information in a widget URL, GitHub issue, or feedback message.

 The public website uses Google Analytics 4 to measure aggregate traffic and understand which pages and referral links are useful. Events cover page views, opening the builder, and selecting a preset. The \`/widget/\` Browser source route is excluded so an OBS source does not look like a new website visit. UTM campaign parameters are removed from the address bar after attribution.

Hosting and security providers may process limited technical request data needed to deliver and protect the site. This project does not use that information to build profiles of players or identify people.

For site questions or requests to correct project content, use the [GitHub repository](https://github.com/nachodeluca/faceitwidget). FACEIT account and platform requests should go to FACEIT support. This is an independent project and is not affiliated with FACEIT.
`,
  ],
])

export const LLMS_PATH = "/llms.txt"

export const NOT_FOUND_MARKDOWN = `# Page not found

The requested FACEIT Widget page does not exist.

Try the [homepage](https://faceitwidget.com/), [widget builder](https://faceitwidget.com/builder/), [OBS setup guide](https://faceitwidget.com/faceit-widget-obs/), or [live stats guide](https://faceitwidget.com/live-faceit-stats/). Machine-readable navigation is available in the [sitemap](https://faceitwidget.com/sitemap.xml) and [llms.txt](https://faceitwidget.com/llms.txt).
`

const MARKDOWN_MEDIA_TYPE = "text/markdown; charset=utf-8"

type AssetFetcher = Pick<Fetcher, "fetch">

function parseQuality(value: string, mediaType: string) {
  const match = value.split(",").find((part) => part.trim().split(";")[0].toLowerCase() === mediaType)
  if (!match) return 0

  const quality = match.split(";").find((part) => part.trim().startsWith("q="))?.trim().slice(2)
  const parsed = quality === undefined ? 1 : Number(quality)
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0
}

export function prefersMarkdown(accept: string | null) {
  if (!accept) return false

  const markdownQuality = parseQuality(accept, "text/markdown")
  const htmlQuality = parseQuality(accept, "text/html")
  return markdownQuality > 0 && (markdownQuality > htmlQuality || htmlQuality === 0)
}

function withHeaders(response: Response, updates: Record<string, string>) {
  const headers = new Headers(response.headers)
  Object.entries(updates).forEach(([name, value]) => headers.set(name, value))
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers })
}

export function withDocumentVary(response: Response) {
  return withHeaders(response, { Vary: "Accept, Accept-Encoding" })
}

function markdownResponse(request: Request, body: string, status = 200) {
  return new Response(request.method === "HEAD" ? null : body, {
    status,
    headers: {
      "Content-Type": MARKDOWN_MEDIA_TYPE,
      Vary: "Accept, Accept-Encoding",
    },
  })
}

export async function serveAgentDocument(request: Request, assets: AssetFetcher) {
  if (request.method !== "GET" && request.method !== "HEAD") return null

  const pathname = new URL(request.url).pathname
  if (pathname === LLMS_PATH) {
    const response = await assets.fetch(request)
    return withHeaders(response, { "Content-Type": MARKDOWN_MEDIA_TYPE })
  }

  const markdown = MARKDOWN_DOCUMENTS.get(pathname)
  if (markdown && prefersMarkdown(request.headers.get("Accept"))) {
    return markdownResponse(request, markdown)
  }

  if (!markdown) return null
  return withDocumentVary(await assets.fetch(request))
}

export function serveNotFound(request: Request, response: Response) {
  if (prefersMarkdown(request.headers.get("Accept"))) {
    return markdownResponse(request, NOT_FOUND_MARKDOWN, 404)
  }

  return withDocumentVary(response)
}

export function getMarkdownDocument(pathname: string) {
  return MARKDOWN_DOCUMENTS.get(pathname)
}
