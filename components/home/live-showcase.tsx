"use client"

import { usePlayerSnapshot, type WidgetData } from "@/lib/widget"

import { DotsRing } from "../ui/dots-ring"
import { PlayerDataBoundary } from "../widget/player-data-boundary"
import { FloatingWidget } from "./floating-widget"
import { SHOWCASE_ITEMS } from "./showcase-layout"
import { ShowcaseSkeleton } from "./showcase-skeleton"

function PresetShowcase({ data }: { data: WidgetData }) {
  return (
    <>
      {SHOWCASE_ITEMS.map(({ preset, className }) => (
        <FloatingWidget key={preset} data={data} preset={preset} className={className} />
      ))}
    </>
  )
}

type LiveShowcaseProps = {
  nickname: string
}

export function LiveShowcase({ nickname }: LiveShowcaseProps) {
  const snapshot = usePlayerSnapshot(nickname, { live: true })

  return (
    <PlayerDataBoundary
      state={snapshot}
      pending={<ShowcaseSkeleton />}
      failed={() => (
        <div className="absolute inset-0 grid place-items-center">
          <DotsRing className="text-text-secondary" label="Live preview" />
        </div>
      )}
    >
      {(data) => <PresetShowcase data={data} />}
    </PlayerDataBoundary>
  )
}
