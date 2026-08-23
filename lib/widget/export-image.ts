const EXPORT_PIXEL_SCALE = 3

function safeFileSegment(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")

  link.download = filename
  link.href = url
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1_000)
}

async function waitForImages(node: HTMLElement) {
  await Promise.all(
    Array.from(node.querySelectorAll("img"), async (image) => {
      if (!image.complete) {
        await new Promise<void>((resolve) => {
          image.addEventListener("load", () => resolve(), { once: true })
          image.addEventListener("error", () => resolve(), { once: true })
        })
      }

      await image.decode().catch(() => undefined)
    }),
  )
}

async function captureVideoFrame(video: HTMLVideoElement) {
  if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA || !video.videoWidth) {
    return null
  }

  const canvas = video.ownerDocument.createElement("canvas")
  canvas.width = video.videoWidth
  canvas.height = video.videoHeight
  const context = canvas.getContext("2d")

  if (!context) return null

  try {
    context.drawImage(video, 0, 0, canvas.width, canvas.height)
    return canvas.toDataURL("image/png")
  } catch {
    return null
  }
}

async function replaceVideoFrames(original: HTMLElement, clone: HTMLElement) {
  const originalVideos = Array.from(original.querySelectorAll("video"))
  const clonedVideos = Array.from(clone.querySelectorAll("video"))

  await Promise.all(
    originalVideos.map(async (video, index) => {
      const clonedVideo = clonedVideos[index]
      if (!clonedVideo) return

      const image = original.ownerDocument.createElement("img")
      image.alt = ""
      image.setAttribute("aria-hidden", "true")
      image.className = clonedVideo.className
      image.style.cssText = clonedVideo.style.cssText
      image.src = (await captureVideoFrame(video)) ?? video.poster
      clonedVideo.replaceWith(image)
    }),
  )
}

function createExportCapture(node: HTMLElement) {
  const frame = node.ownerDocument.createElement("div")
  const clone = node.cloneNode(true) as HTMLElement
  const surface = clone.querySelector<HTMLElement>("[data-widget-surface]")

  frame.style.cssText = [
    "position: fixed",
    "left: -100000px",
    "top: 0",
    "display: inline-block",
    "padding: 1px",
    "background: transparent",
    "pointer-events: none",
  ].join(";")

  if (surface) {
    surface.style.boxShadow = "none"
  }

  frame.appendChild(clone)
  node.ownerDocument.body.appendChild(frame)

  return { frame, node: clone }
}

export async function createWidgetPng(node: HTMLElement) {
  await node.ownerDocument.fonts.ready

  if (node.offsetWidth === 0 || node.offsetHeight === 0) {
    throw new Error("The widget is not ready to export.")
  }

  const capture = createExportCapture(node)

  try {
    const { snapdom } = await import("@zumer/snapdom")
    await replaceVideoFrames(node, capture.node)
    await waitForImages(capture.node)

    return await snapdom.toBlob(capture.frame, {
      type: "png",
      format: "png",
      scale: EXPORT_PIXEL_SCALE,
      dpr: 1,
      embedFonts: true,
      reconcile: true,
      fast: false,
      compress: false,
      outerTransforms: true,
      outerShadows: false,
    })
  } finally {
    capture.frame.remove()
  }
}

export async function downloadWidgetPng(
  node: HTMLElement,
  options: { nickname: string; preset: string },
) {
  const blob = await createWidgetPng(node)

  const nickname = safeFileSegment(options.nickname) || "player"
  const preset = safeFileSegment(options.preset) || "widget"
  downloadBlob(blob, `faceit-${nickname}-${preset}.png`)
}
