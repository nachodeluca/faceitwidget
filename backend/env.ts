import type { PlayerSnapshotCoordinator } from "./snapshot-coordinator"
import type { SharedWidgetCard } from "./shared-widget-card"

export interface WorkerEnv {
  ASSETS: Fetcher
  PLAYER_SNAPSHOTS: DurableObjectNamespace<PlayerSnapshotCoordinator>
  SHARED_WIDGETS: DurableObjectNamespace<SharedWidgetCard>
  API_RATE_LIMIT: RateLimit
  PLAYER_RATE_LIMIT: RateLimit
  SHARE_RATE_LIMIT: RateLimit
  BACKGROUND_RATE_LIMIT: RateLimit
  USER_BACKGROUNDS: R2Bucket
  FACEIT_DATA_API_KEY?: string
  R2_ACCESS_KEY_ID?: string
  R2_SECRET_ACCESS_KEY?: string
  R2_ACCOUNT_ID?: string
  R2_BUCKET_NAME?: string
  R2_PUBLIC_BASE_URL?: string
  LIVE_POLL_INTERVAL_MS?: string
}
