import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { PresetLivePreview } from "@/components/site/preset-live-preview"
import { SitePage } from "@/components/site/site-page"
import { WIDGET_PRESETS } from "@/lib/widget/config/presets"
import { isWidgetPresetId } from "@/lib/widget/types"
import {
  createLandingMetadata,
  presetPath,
  SITE_PATHS,
} from "@/lib/site-metadata"
import {
  builderPresetHref,
  getCaptureSummary,
  getEditableFieldLabels,
  getPresetById,
  getVisibleFieldKeys,
  presetLandingDescription,
  presetLandingTitle,
  PRESET_PREVIEW_NICKNAME,
} from "@/lib/site-presets"
import { visibilityLabel } from "@/lib/widget/visibility-labels"

type PresetPageProps = {
  params: Promise<{ preset: string }>
}

export function generateStaticParams() {
  return WIDGET_PRESETS.map((preset) => ({ preset: preset.id }))
}

export async function generateMetadata({ params }: PresetPageProps): Promise<Metadata> {
  const { preset: presetId } = await params
  const preset = getPresetById(presetId)
  if (!preset) return {}

  const title = presetLandingTitle(preset)
  const description = presetLandingDescription(preset)
  const path = presetPath(preset.id)

  return {
    ...createLandingMetadata({ title, description, path }),
    title: { absolute: title },
  }
}

export default async function PresetLandingPage({ params }: PresetPageProps) {
  const { preset: presetId } = await params
  if (!isWidgetPresetId(presetId)) notFound()

  const preset = getPresetById(presetId)
  if (!preset) notFound()

  const path = presetPath(preset.id)
  const title = presetLandingTitle(preset)
  const description = presetLandingDescription(preset)
  const captureFields = getVisibleFieldKeys(preset)
  const editableLabels = getEditableFieldLabels(preset)
  const otherPresets = WIDGET_PRESETS.filter((entry) => entry.id !== preset.id)
  const builderHref = builderPresetHref(preset.id)

  return (
    <SitePage
      title={title}
      description={description}
      path={path}
      showBuilderCta
      builderHref={builderHref}
      lead={<PresetLivePreview presetId={preset.id} nickname={PRESET_PREVIEW_NICKNAME} />}
    >
      <h2>What this preset shows</h2>
      <p>{getCaptureSummary(preset)}</p>
      <ul>
        {captureFields.map((key) => (
          <li key={key}>{visibilityLabel(key)}</li>
        ))}
      </ul>

      <h2>Fields you can toggle</h2>
      <p>In the builder you can turn these fields on or off for the {preset.label} layout:</p>
      <ul>
        {editableLabels.map((label) => (
          <li key={label}>{label}</li>
        ))}
      </ul>
      {preset.supportsRotation ? (
        <p>
          This preset also supports rotating stats panels so viewers can see more than one block of match data over
          time.
        </p>
      ) : null}

      <h2>Use {preset.label} on stream</h2>
      <ol>
        <li>
          Open the <Link href={builderHref}>builder with the {preset.label} preset</Link>.
        </li>
        <li>Enter the exact public FACEIT nickname.</li>
        <li>Confirm the preview, then copy the widget URL.</li>
        <li>
          Add it as a Browser Source in <Link href={SITE_PATHS.faceitWidgetObsGuide}>OBS</Link> or{" "}
          <Link href={SITE_PATHS.faceitWidgetStreamlabsGuide}>Streamlabs</Link>.
        </li>
      </ol>

      <h2>Other presets</h2>
      <ul>
        {otherPresets.map((entry) => (
          <li key={entry.id}>
            <Link href={presetPath(entry.id)}>{entry.label}</Link> — {entry.description}
          </li>
        ))}
      </ul>
      <p>
        Or browse the full <Link href={SITE_PATHS.presets}>presets index</Link>.
      </p>
    </SitePage>
  )
}
