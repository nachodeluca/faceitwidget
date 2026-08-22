import { MessageSquarePlus } from "lucide-react"

import { SITE_LINKS } from "@/lib/site-links"

export function PresetSuggestionCard() {
  return (
    <a
      className="group flex min-h-[118px] items-center justify-center rounded-md border border-dashed border-border/80 bg-background/30 p-4 text-on-surface transition-[border-color,background-color,transform] duration-150 ease-[var(--ease-out)] hover:border-foreground/50 hover:bg-surface/60 active:scale-[0.985] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
      href={SITE_LINKS.suggestPreset}
      rel="noreferrer"
      target="_blank"
    >
      <span className="flex items-center gap-2 text-sm font-semibold">
        <MessageSquarePlus
          aria-hidden="true"
          className="size-4 text-muted-foreground transition-colors duration-150 ease-[var(--ease-out)] group-hover:text-foreground"
        />
        <span>Suggest a preset</span>
      </span>
    </a>
  )
}
