"use client"

import { useSearchParams } from "next/navigation"

import { Widget } from "@/components/widget/widget"
import { PlayerDataBoundary } from "@/components/widget/player-data-boundary"
import {
  deserializeConfig,
  getBrowserTimezone,
  OBS_OUTPUT_SCALE,
  usePlayerSnapshot,
} from "@/lib/widget"

export function WidgetClient() {
  const searchParams = useSearchParams()
  const lookup = searchParams.get("playerId")?.trim() || searchParams.get("nickname")?.trim() || ""
  const timezone = searchParams.get("tz") || getBrowserTimezone()
  const config = deserializeConfig(searchParams.get("config") ?? undefined)
  const snapshot = usePlayerSnapshot(lookup, {
    live: true,
    timezone,
  })

  return (
    <PlayerDataBoundary state={snapshot} pending={null}>
      {(data) => <Widget data={data} config={config} outputScale={OBS_OUTPUT_SCALE} />}
    </PlayerDataBoundary>
  )
}
