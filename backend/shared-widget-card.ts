import { DurableObject } from "cloudflare:workers"

import type { WorkerEnv } from "./env"

const RECORD_KEY = "shared-widget"
const SHARE_LIFETIME_MS = 90 * 24 * 60 * 60 * 1_000

type SharedWidgetRecord = {
  image: ArrayBuffer
  nickname: string
  preset: string
  expiresAt: number
}

export class SharedWidgetCard extends DurableObject<WorkerEnv> {
  private async record() {
    const record = await this.ctx.storage.get<SharedWidgetRecord>(RECORD_KEY)

    if (record && record.expiresAt <= Date.now()) {
      await this.ctx.storage.deleteAll()
      return undefined
    }

    return record
  }

  async fetch(request: Request) {
    const url = new URL(request.url)

    if (request.method === "POST" && url.pathname === "/") {
      const record: SharedWidgetRecord = {
        image: await request.arrayBuffer(),
        nickname: request.headers.get("X-Widget-Nickname") ?? "FACEIT player",
        preset: request.headers.get("X-Widget-Preset") ?? "widget",
        expiresAt: Date.now() + SHARE_LIFETIME_MS,
      }

      await this.ctx.storage.put(RECORD_KEY, record)
      await this.ctx.storage.setAlarm(record.expiresAt)
      return new Response(null, { status: 204 })
    }

    const record = await this.record()
    if (!record) return new Response(null, { status: 404 })

    if (request.method === "GET" && url.pathname === "/image.png") {
      return new Response(record.image, {
        headers: {
          "Cache-Control": "public, max-age=86400, immutable",
          "Content-Type": "image/png",
        },
      })
    }

    if (request.method === "GET" && url.pathname === "/metadata") {
      return Response.json({ nickname: record.nickname, preset: record.preset })
    }

    return new Response(null, { status: 404 })
  }

  async alarm() {
    await this.ctx.storage.deleteAll()
  }
}
