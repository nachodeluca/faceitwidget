export async function createWidgetShare(
  image: Blob,
  options: { nickname: string; preset: string },
) {
  const response = await fetch("/api/v1/shares", {
    method: "POST",
    body: image,
    headers: {
      "Content-Type": "image/png",
      "X-Widget-Nickname": options.nickname,
      "X-Widget-Preset": options.preset,
    },
  })

  if (!response.ok) {
    throw new Error("The shared widget image could not be published.")
  }

  const payload = await response.json() as { shareUrl?: unknown }
  if (typeof payload.shareUrl !== "string") {
    throw new Error("The share service returned an invalid URL.")
  }

  return payload.shareUrl
}

export function xShareIntent(shareUrl: string) {
  const params = new URLSearchParams({
    text: "My live FACEIT stats widget",
    url: shareUrl,
  })

  return `https://x.com/intent/post?${params}`
}
