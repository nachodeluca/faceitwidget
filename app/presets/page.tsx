import type { Metadata } from "next"
import Link from "next/link"

import { SitePage } from "@/components/site/site-page"
import { APP_PATHS, createLandingMetadata, presetPath, SITE_PATHS } from "@/lib/site-metadata"
import { builderPresetHref, getCaptureSummary } from "@/lib/site-presets"
import { WIDGET_PRESETS } from "@/lib/widget/config/presets"

const path = SITE_PATHS.presets
const title = "FACEIT Widget Presets - ELO, Rank, Compact & More"
const description =
  "Browse FACEIT Widget presets for OBS and Streamlabs: ELO Pill, Rank & ELO, Compact, Profile, Performance, Rich stats, Today, and more."

export const metadata: Metadata = {
  ...createLandingMetadata({ title, description, path }),
  title: { absolute: title },
}

export default function PresetsIndexPage() {
  return (
    <SitePage
      title={title}
      description="Choose a layout that fits your stream scene, then open the builder with that preset already selected."
      path={path}
      showBuilderCta
      builderHref={APP_PATHS.builder}
    >
      <h2>Available presets</h2>
      <p>
        Each preset starts with a different mix of FACEIT ELO, rank, and match statistics. You can
        turn fields on or off in the builder before you copy the Browser Source URL for{" "}
        <Link href={SITE_PATHS.faceitWidgetObsGuide}>OBS</Link> or{" "}
        <Link href={SITE_PATHS.faceitWidgetStreamlabsGuide}>Streamlabs</Link>.
      </p>

      <ul>
        {WIDGET_PRESETS.map((preset) => (
          <li key={preset.id}>
            <Link href={presetPath(preset.id)}>{preset.label}</Link>
            {" — "}
            {preset.description}. {getCaptureSummary(preset)}{" "}
            <Link href={builderPresetHref(preset.id)}>Open in builder</Link>.
          </li>
        ))}
      </ul>

      <h2>How to use a preset</h2>
      <ol>
        <li>Open a preset page or pick one in the builder.</li>
        <li>Enter the exact public FACEIT nickname.</li>
        <li>Adjust visible fields, colors, and background.</li>
        <li>Copy the URL into an OBS or Streamlabs Browser Source.</li>
      </ol>
    </SitePage>
  )
}
