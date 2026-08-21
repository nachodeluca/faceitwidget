import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Radio } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SITE_PATHS } from "@/lib/site-metadata"

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
      <span className="block whitespace-nowrap">FACEIT stats</span>
      <span className="mt-1 flex items-center whitespace-nowrap text-[0.78em] leading-[0.92] text-muted-foreground">
        <span>in the</span>
        <span className="group/frame relative isolate ml-[0.1em] inline-block overflow-visible rounded-[0.14em] border border-border-strong bg-surface-raised/60 px-[0.14em] py-[0.02em] leading-[0.86] text-muted-foreground shadow-[inset_0_1px_rgb(255_255_255_/_4%)] motion-safe:transition-[background-color,border-color,box-shadow,color,transform] motion-safe:duration-[220ms] motion-safe:ease-[var(--ease-out)] [@media(hover:hover)_and_(pointer:fine)]:hover:scale-[1.015] [@media(hover:hover)_and_(pointer:fine)]:hover:-translate-y-0.5 [@media(hover:hover)_and_(pointer:fine)]:hover:border-foreground/45 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-surface-hover/85 [@media(hover:hover)_and_(pointer:fine)]:hover:text-foreground [@media(hover:hover)_and_(pointer:fine)]:hover:shadow-[0_8px_24px_rgb(0_0_0_/_16%),inset_0_1px_rgb(255_255_255_/_7%)] motion-reduce:transition-none">
          <span className="relative z-10">frame</span>
          <Image
            src="/logo.svg"
            alt=""
            aria-hidden="true"
            width={64}
            height={64}
            className="pointer-events-none absolute -right-[0.16em] -top-[0.3em] z-20 size-[0.4em] -rotate-12 scale-[0.92] opacity-0 motion-safe:transition-[opacity,transform,filter] motion-safe:duration-[220ms] motion-safe:ease-[var(--ease-out)] [@media(hover:hover)_and_(pointer:fine)]:group-hover/frame:rotate-6 [@media(hover:hover)_and_(pointer:fine)]:group-hover/frame:scale-100 [@media(hover:hover)_and_(pointer:fine)]:group-hover/frame:opacity-100 [@media(hover:hover)_and_(pointer:fine)]:group-hover/frame:drop-shadow-[0_3px_7px_rgb(255_111_0_/_22%)] motion-reduce:transition-opacity"
          />
        </span>
        <span className="ml-[0.02em] text-muted-foreground">.</span>
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
          <p className="mt-6 max-w-[350px] text-[14px] leading-6 text-muted-foreground sm:text-[15px]">
            Choose a preset, tune the details, and follow the{" "}
            <Link
              href={SITE_PATHS.faceitWidgetObsGuide}
              prefetch={false}
              className="text-text-secondary underline decoration-white/25 underline-offset-4 transition-[color,text-decoration-color] duration-150 hover:text-foreground hover:decoration-white/70"
            >
              FACEIT Widget setup for OBS
            </Link>
            .
          </p>
          <Button
            render={<Link href={{ pathname: "/builder", query: { nickname: player } }} prefetch={false} />}
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
