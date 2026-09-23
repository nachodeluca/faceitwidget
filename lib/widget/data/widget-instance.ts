const STORAGE_KEY = "faceitwidget.widget-instance.v1"

function fallbackId() {
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    const bytes = new Uint8Array(16)
    crypto.getRandomValues(bytes)
    return [...bytes].map((value) => value.toString(16).padStart(2, "0")).join("")
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
}

export function getWidgetInstanceId() {
  if (typeof window === "undefined") return ""

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored && /^[a-z0-9-]{16,80}$/i.test(stored)) return stored

    const id = fallbackId()
    window.localStorage.setItem(STORAGE_KEY, id)
    return id
  } catch {
    return fallbackId()
  }
}
