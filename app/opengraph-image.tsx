import { readFile } from "node:fs/promises"
import { join } from "node:path"

import { ImageResponse } from "next/og"

export const alt = "FACEIT Widget for OBS"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"
export const dynamic = "force-static"

const logoData = await readFile(join(process.cwd(), "public", "logo.svg"), "base64")
const logoSrc = `data:image/svg+xml;base64,${logoData}`

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        alignItems: "center",
        background: "#121212",
        color: "#fff",
        display: "flex",
        height: "100%",
        justifyContent: "space-between",
        padding: "72px",
        width: "100%",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", maxWidth: 850 }}>
        <div
          style={{
            alignItems: "center",
            color: "#d8d8d8",
            display: "flex",
            fontSize: 24,
            marginBottom: 30,
          }}
        >
          <span
            style={{
              background: "#00d084",
              borderRadius: 999,
              display: "flex",
              height: 12,
              marginRight: 14,
              width: 12,
            }}
          />
          Live stats on your streams
        </div>
        <div style={{ display: "flex", fontSize: 92, fontWeight: 700, letterSpacing: -5 }}>
          FACEIT stats in the frame.
        </div>
        <div style={{ color: "#a3a3a3", display: "flex", fontSize: 30, marginTop: 30 }}>
          Free CS2 overlays for OBS
        </div>
      </div>

      <div
        style={{
          alignItems: "center",
          display: "flex",
          height: 220,
          justifyContent: "center",
          marginLeft: 52,
          width: 220,
        }}
      >
        <img alt="" src={logoSrc} style={{ height: 220, width: 220 }} />
      </div>
    </div>,
    size,
  )
}
