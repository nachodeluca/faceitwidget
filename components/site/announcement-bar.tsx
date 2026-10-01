import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { APP_PATHS } from "@/lib/site-metadata"
import { CompactPresetLink } from "./compact-preset-link"

export function AnnouncementBar() {
  return (
    <aside
      aria-label="Announcement"
      className="sticky top-0 z-40 border-b border-border/70 bg-secondary/95 text-secondary-foreground backdrop-blur-sm"
    >
      <div className="mx-auto flex min-h-12 w-full max-w-[1280px] flex-wrap items-center justify-center gap-x-3 gap-y-2 px-4 py-2 sm:px-6 lg:px-10">
        <Badge
          variant="secondary"
          className="h-5 rounded-full border-emerald-400/30 bg-emerald-400/15 px-1.5 text-[9px] font-bold uppercase tracking-[0.08em] text-emerald-300"
        >
          NEW
        </Badge>
        <div className="text-center text-xs leading-5 text-secondary-foreground/85 sm:text-sm">
          <span className="font-semibold text-secondary-foreground">New preset:</span>{" "}
          <CompactPresetLink />{" "}
          is here with ELO, regional and country ranks, and last-30 match stats.
        </div>
        <Link
          href={{ pathname: APP_PATHS.builder, query: { preset: "compact" } }}
          className="shrink-0 text-xs font-semibold text-foreground underline decoration-white/25 underline-offset-4 transition-[color,text-decoration-color] duration-150 hover:decoration-white/70 focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 sm:text-sm"
        >
          Try it
        </Link>
      </div>
    </aside>
  )
}
