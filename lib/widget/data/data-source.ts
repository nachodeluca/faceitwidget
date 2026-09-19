import type { WidgetSnapshot } from "../types"

export interface WidgetDataSource {
  getPlayerSnapshot(
    lookup: string,
    options?: { timezone?: string; signal?: AbortSignal },
  ): Promise<WidgetSnapshot>
}
