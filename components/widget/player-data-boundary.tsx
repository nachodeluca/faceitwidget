import type { ReactNode } from "react"

import type { PlayerSnapshotState } from "@/lib/widget/data/use-player-snapshot"
import type { WidgetData } from "@/lib/widget"

type PlayerDataBoundaryProps = {
  state: PlayerSnapshotState
  idle?: ReactNode
  pending: ReactNode
  failed?: (message: string) => ReactNode
  children: (data: WidgetData) => ReactNode
}

export function PlayerDataBoundary({
  state,
  idle,
  pending,
  failed = () => null,
  children,
}: PlayerDataBoundaryProps) {
  switch (state.status) {
    case "idle":
      return idle ?? pending
    case "loading":
      return pending
    case "error":
      return failed(state.error)
    default:
      return children(state.data)
  }
}
