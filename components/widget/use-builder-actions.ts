"use client"

import { useState, type RefObject } from "react"

import { buildWidgetUrl, getBrowserTimezone, type WidgetConfig } from "@/lib/widget"
import { createWidgetPng, downloadWidgetPng } from "@/lib/widget/export-image"
import { createWidgetShare, xShareIntent } from "@/lib/widget/sharing/share-card"

import type { ShareStatus } from "./builder-types"

function useClipboard() {
  const [copied, setCopied] = useState(false)

  async function copyUrl(url: string) {
    if (!url) return

    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1_800)
    } catch {
      setCopied(false)
    }
  }

  return { copied, copyUrl }
}

type PreviewActionOptions = {
  config: WidgetConfig
  nickname: string
  previewWidgetRef: RefObject<HTMLDivElement | null>
}

function useWidgetExport({ config, nickname, previewWidgetRef }: PreviewActionOptions) {
  const [exportingImage, setExportingImage] = useState(false)

  async function downloadPreview() {
    const node = previewWidgetRef.current
    if (!node || exportingImage) return

    setExportingImage(true)
    try {
      await downloadWidgetPng(node, { nickname, preset: config.preset })
    } catch (error) {
      console.error("Unable to export widget image", error)
    } finally {
      setExportingImage(false)
    }
  }

  return { exportingImage, downloadPreview }
}

function useWidgetShare({ config, nickname, previewWidgetRef }: PreviewActionOptions) {
  const [shareStatus, setShareStatus] = useState<ShareStatus>("idle")

  async function shareOnX() {
    const node = previewWidgetRef.current
    if (!node || shareStatus === "preparing") return

    const shareWindow = window.open("about:blank", "faceit-widget-share", "popup,width=720,height=640")
    if (shareWindow) shareWindow.opener = null

    setShareStatus("preparing")
    try {
      const image = await createWidgetPng(node)
      const shareUrl = await createWidgetShare(image, { nickname, preset: config.preset })
      const shareIntent = xShareIntent(shareUrl)
      if (shareWindow && !shareWindow.closed) shareWindow.location.replace(shareIntent)
      else window.location.assign(shareIntent)

      const copyShareUrl = navigator.clipboard?.writeText(shareUrl)
      void copyShareUrl?.catch(() => undefined)
      setShareStatus("opened")
      window.setTimeout(() => setShareStatus("idle"), 1_800)
    } catch (error) {
      shareWindow?.close()
      console.error("Unable to share widget image", error)
      setShareStatus("error")
      window.setTimeout(() => setShareStatus("idle"), 1_800)
    }
  }

  return { shareStatus, shareOnX }
}

export function useBuilderActions({ config, nickname, previewWidgetRef }: PreviewActionOptions) {
  const [copyDialogOpen, setCopyDialogOpen] = useState(false)
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false)
  const [widgetUrl, setWidgetUrl] = useState("")
  const clipboard = useClipboard()
  const widgetExport = useWidgetExport({ config, nickname, previewWidgetRef })
  const widgetShare = useWidgetShare({ config, nickname, previewWidgetRef })

  function currentWidgetUrl() {
    return buildWidgetUrl(window.location.origin, nickname, config, getBrowserTimezone())
  }

  async function copyWidgetUrl() {
    const url = currentWidgetUrl()
    setWidgetUrl(url)
    setCopyDialogOpen(true)
    await clipboard.copyUrl(url)
  }

  return {
    ...clipboard,
    ...widgetExport,
    ...widgetShare,
    copyDialogOpen,
    feedbackDialogOpen,
    widgetUrl,
    setCopyDialogOpen,
    setFeedbackDialogOpen,
    copyWidgetUrl,
  }
}
