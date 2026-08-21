import type { WidgetLiveMessage, WidgetSnapshot } from "../types"

export interface WidgetDataSource {
  getPlayerSnapshot(
    lookup: string,
    options?: { timezone?: string; signal?: AbortSignal },
  ): Promise<WidgetSnapshot>
}

export interface WidgetLiveSource extends WidgetDataSource {
  subscribe(
    lookup: string,
    options: {
      timezone?: string
      onMessage: (message: WidgetLiveMessage) => void
      onDisconnect?: () => void
    },
  ): () => void
}
