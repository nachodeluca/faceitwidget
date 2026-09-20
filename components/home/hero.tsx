import Link from "next/link"
import { ArrowRight, Radio } from "lucide-react"

import { ObsMark } from "@/components/icons/obs-mark"
import { StreamlabsMark } from "@/components/icons/streamlabs-mark"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { APP_PATHS, SITE_PATHS } from "@/lib/site-metadata"

import { MapBackground } from "./map-background"
import { Showcase } from "./showcase"

function LiveBadge() {
  return (
    <Link
      href={SITE_PATHS.liveFaceitStatsGuide}
      prefetch={false}
      className="group/live-badge inline-flex rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
    >
      <Badge
        variant="outline"
        className="h-7 gap-2 rounded-full border-border-muted bg-surface-raised/80 px-3 text-[11px] font-medium tracking-[-0.01em] text-text-secondary shadow-sm backdrop-blur-sm transition-[border-color,background-color,color] duration-150 ease-[var(--ease-out)] group-hover/live-badge:border-foreground/25 group-hover/live-badge:bg-surface-hover group-hover/live-badge:text-foreground"
      >
        <span className="relative flex size-3 items-center justify-center">
          <span className="absolute size-3 rounded-full bg-emerald-400/25 motion-safe:animate-ping motion-reduce:animate-none" />
          <Radio aria-hidden="true" className="relative size-3 text-emerald-400" />
        </span>
        Live stats on your streams
      </Badge>
    </Link>
  )
}

function HeroTitle() {
  return (
    <h1 id="hero-title" className="mt-6 max-w-[620px] text-[clamp(3rem,6.5vw,6.5rem)] font-semibold leading-[0.96] tracking-[-0.075em] text-foreground">
      <span className="block whitespace-nowrap">FACEIT Widget</span>
      <span className="mt-2 flex max-w-full items-center gap-[0.18em] whitespace-nowrap text-[0.7em] leading-[0.92] text-muted-foreground">
        <span aria-hidden="true">for</span>
        <span className="inline-flex shrink-0 items-center gap-[0.12em] rounded-[0.2em] border border-border-strong bg-surface-raised/70 px-[0.14em] py-[0.09em] text-foreground shadow-[inset_0_1px_rgb(255_255_255_/_6%)]">
          <ObsMark className="size-[0.6em]" />
          <span className="text-[0.36em] font-semibold leading-none tracking-[-0.01em]">OBS</span>
        </span>
        <span aria-hidden="true">and</span>
        <span className="inline-flex shrink-0 items-center gap-[0.12em] rounded-[0.2em] border border-border-strong bg-surface-raised/70 px-[0.14em] py-[0.09em] text-foreground shadow-[inset_0_1px_rgb(255_255_255_/_6%)]">
          <StreamlabsMark className="size-[0.6em]" />
          <span className="text-[0.36em] font-semibold leading-none tracking-[-0.01em]">Streamlabs</span>
        </span>
      </span>
    </h1>
  )
}

type HeroProps = {
  player: string
}

export function Hero({ player }: HeroProps) {
  return (
    <section className="relative mx-auto flex min-h-0 w-full max-w-[1440px] items-center px-4 py-10 pb-16 sm:px-6 sm:pb-24 lg:min-h-svh lg:px-10 lg:py-14 lg:pb-24" aria-labelledby="hero-title">
      <div className="grid w-full items-center gap-10 lg:grid-cols-[minmax(0,0.78fr)_minmax(560px,1.22fr)] lg:gap-8">
        <div className="relative z-10 max-w-[600px]">
          <LiveBadge />
          <HeroTitle />
          <p className="mt-6 max-w-[500px] text-[14px] leading-6 text-muted-foreground sm:text-[15px]">
            Build a free{" "}
            <Link
              href={SITE_PATHS.faceitWidgetObsGuide}
              prefetch={false}
              className="text-text-secondary underline decoration-white/25 underline-offset-4 transition-[color,text-decoration-color] duration-150 hover:text-foreground hover:decoration-white/70"
            >
              FACEIT widget for OBS
            </Link>
            . Show live ELO, rank, K/D, and recent matches with one browser-source URL.
          </p>
          <Button
            render={<Link href={{ pathname: APP_PATHS.builder, query: { nickname: player } }} prefetch={false} />}
            nativeButton={false}
            size="lg"
            icon={<ArrowRight />}
            iconPosition="end"
            className="mt-7 h-11 rounded-lg px-4 text-[13px] font-semibold"
          >
            Create your widget
          </Button>
        </div>

        <div className="relative min-h-[360px] lg:min-h-[480px]">
          <MapBackground className="inset-[4%_0_0_6%] opacity-30 [mask-image:radial-gradient(ellipse_at_center,black_28%,transparent_76%)]" />
          <Showcase nickname={player} />
        </div>
      </div>
    </section>
  )
}
