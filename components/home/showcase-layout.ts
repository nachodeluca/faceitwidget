import type { WidgetPresetId } from "@/lib/widget"

export type ShowcaseItem = {
  preset: WidgetPresetId
  size: "pill" | "card"
  className: string
}

export const SHOWCASE_ITEMS = [
  {
    preset: "elo-pill",
    size: "pill",
    className:
      "absolute left-[2%] top-[9%] -rotate-3 opacity-80 transition-[filter,opacity,transform] duration-250 ease-[var(--ease-out)] max-lg:left-[5%] max-lg:top-[5%] max-lg:scale-[0.72] [@media(hover:hover)_and_(pointer:fine)]:hover:-translate-y-1 [@media(hover:hover)_and_(pointer:fine)]:hover:brightness-[1.05] [@media(hover:hover)_and_(pointer:fine)]:hover:opacity-90",
  },
  {
    preset: "rank-country",
    size: "pill",
    className:
      "absolute right-[1%] top-[15%] rotate-2 opacity-80 transition-[filter,opacity,transform] duration-250 ease-[var(--ease-out)] max-lg:right-[2%] max-lg:top-[8%] max-lg:scale-[0.62] [@media(hover:hover)_and_(pointer:fine)]:hover:translate-x-1 [@media(hover:hover)_and_(pointer:fine)]:hover:brightness-[1.05] [@media(hover:hover)_and_(pointer:fine)]:hover:opacity-90",
  },
  {
    preset: "rich-profile",
    size: "card",
    className:
      "absolute left-[14%] top-[29%] z-[2] -rotate-2 scale-[1.02] transition-[filter,opacity,transform] duration-250 ease-[var(--ease-out)] max-lg:left-[6%] max-lg:top-[31%] max-lg:scale-[0.66] [@media(hover:hover)_and_(pointer:fine)]:hover:rotate-0 [@media(hover:hover)_and_(pointer:fine)]:hover:brightness-[1.05]",
  },
  {
    preset: "today-stats",
    size: "card",
    className:
      "absolute bottom-[5%] right-[7%] z-[3] rotate-2 opacity-90 transition-[filter,opacity,transform] duration-250 ease-[var(--ease-out)] max-lg:right-[2%] max-lg:bottom-[16%] max-lg:scale-[0.64] [@media(hover:hover)_and_(pointer:fine)]:hover:-translate-y-1 [@media(hover:hover)_and_(pointer:fine)]:hover:brightness-[1.05] [@media(hover:hover)_and_(pointer:fine)]:hover:opacity-95",
  },
  {
    preset: "profile-card",
    size: "card",
    className:
      "absolute bottom-[4%] left-[5%] z-[1] -rotate-2 transition-[filter,transform] duration-250 ease-[var(--ease-out)] max-lg:left-[3%] max-lg:bottom-[2%] max-lg:scale-[0.62] [@media(hover:hover)_and_(pointer:fine)]:hover:translate-y-1 [@media(hover:hover)_and_(pointer:fine)]:hover:brightness-[1.05]",
  },
] as const satisfies readonly ShowcaseItem[]
