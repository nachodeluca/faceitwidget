import type { PlayerSnapshotCoordinator } from "./snapshot-coordinator"
import type { SharedWidgetCard } from "./shared-widget-card"

export interface WorkerEnv {
  ASSETS: Fetcher
  PLAYER_SNAPSHOTS: DurableObjectNamespace<PlayerSnapshotCoordinator>
  SHARED_WIDGETS: DurableObjectNamespace<SharedWidgetCard>
  API_RATE_LIMIT: RateLimit
  PLAYER_RATE_LIMIT: RateLimit
  SHARE_RATE_LIMIT: RateLimit
  FACEIT_DATA_API_KEY?: string
  LIVE_POLL_INTERVAL_MS?: string
}
