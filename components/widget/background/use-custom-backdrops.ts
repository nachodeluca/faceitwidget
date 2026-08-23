"use client"

import { useCallback, useMemo, useSyncExternalStore } from "react"

import {
  addCustomBackdrop,
  CUSTOM_BACKDROP_STORAGE_KEY,
  parseCustomBackdrops,
  type CustomBackdropRecord,
} from "@/lib/widget"

const CHANGE_EVENT = "faceitwidget:custom-backgrounds"

function subscribe(listener: () => void) {
  if (typeof window === "undefined") return () => undefined
  window.addEventListener("storage", listener)
  window.addEventListener(CHANGE_EVENT, listener)
  return () => {
    window.removeEventListener("storage", listener)
    window.removeEventListener(CHANGE_EVENT, listener)
  }
}

function clientSnapshot() {
  try {
    return window.localStorage.getItem(CUSTOM_BACKDROP_STORAGE_KEY) ?? "[]"
  } catch {
    return "[]"
  }
}

function serverSnapshot() {
  return "[]"
}

export function useCustomBackdrops() {
  const serialized = useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot)
  const backdrops = useMemo(() => parseCustomBackdrops(serialized), [serialized])

  const addBackdrop = useCallback((backdrop: CustomBackdropRecord) => {
    addCustomBackdrop(backdrop)
    window.dispatchEvent(new Event(CHANGE_EVENT))
  }, [])

  return { backdrops, addBackdrop }
}
