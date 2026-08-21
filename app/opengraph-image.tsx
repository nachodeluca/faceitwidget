import { readFile } from "node:fs/promises"
import { join } from "node:path"

import { ImageResponse } from "next/og"

export const alt = "FACEIT Widget for OBS"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"
export const dynamic = "force-static"

const previewData = await readFile(
  join(process.cwd(), ".github", "assets", "preview.png"),
  "base64",
)
const previewSrc = `data:image/png;base64,${previewData}`

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ display: "flex", height: "100%", width: "100%" }}>
      <img
        alt=""
        src={previewSrc}
        style={{ height: "100%", objectFit: "contain", width: "100%" }}
      />
    </div>,
    size,
  )
}
