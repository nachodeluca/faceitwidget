export const WIDGET_MAPS = [
  { id: "none", label: "No map", src: null, iconSrc: null },
  { id: "cache", label: "Cache", src: "/maps/de_cache.webp", iconSrc: "/maps/icons/de_cache.png" },
  { id: "ancient", label: "Ancient", src: "/maps/de_ancient.jpg", iconSrc: "/maps/icons/de_ancient.png" },
  { id: "anubis", label: "Anubis", src: "/maps/de_anubis.jpg", iconSrc: "/maps/icons/de_anubis.png" },
  { id: "dust2", label: "Dust II", src: "/maps/de_dust2.jpg", iconSrc: "/maps/icons/de_dust2.png" },
  { id: "inferno", label: "Inferno", src: "/maps/de_inferno.jpeg", iconSrc: "/maps/icons/de_inferno.png" },
  { id: "mirage", label: "Mirage", src: "/maps/de_mirage.jpg", iconSrc: "/maps/icons/de_mirage.png" },
  { id: "nuke", label: "Nuke", src: "/maps/de_nuke.jpeg", iconSrc: "/maps/icons/de_nuke.png" },
  { id: "vertigo", label: "Vertigo", src: "/maps/de_vertigo.jpeg", iconSrc: "/maps/icons/de_vertigo.png" },
] as const

export type WidgetMapId = (typeof WIDGET_MAPS)[number]["id"]
