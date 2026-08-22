import type { CSSProperties, ReactNode } from "react"
import Image from "next/image"
import { Globe2 } from "lucide-react"

import {
  CHALLENGER_RANK_COLORS,
  hasEloChange,
  isChallengerRank,
  type WidgetData,
  type WidgetVisibility,
} from "@/lib/widget"
import { formatNumber } from "@/lib/format"
import { cn } from "@/lib/utils"

import { AnimatedNumber } from "./animated-number"
import { ChallengerMark } from "./challenger-mark"
import { getWinRateTone } from "./stat-tone"

export { ChallengerMark } from "./challenger-mark"

const levelAsset = (data: WidgetData) => {
  const level = Math.min(10, Math.max(1, Math.round(data.rank.level || 1)))
  return `/levels/${String(level).padStart(2, "0")}.svg`
}
export function PlayerNickname({
  data,
  className,
}: {
  data: WidgetData
  className?: string
}) {
  return (
    <strong
      className={cn(
        "shrink-0 whitespace-nowrap text-[13px] font-bold leading-none text-[color:var(--widget-text)]",
        className,
      )}
      data-widget-nickname
    >
      {data.profile.nickname}
    </strong>
  )
}
export function LevelMark({
  data,
  visibility,
  className,
}: {
  data: WidgetData
  visibility: WidgetVisibility
  className?: string
}) {
  const challenger = isChallengerRank(data.rank)
  const showChallenger = challenger && visibility.challenger
  const showLevel = visibility.level && (!challenger || !visibility.challenger)

  if (!showChallenger && !showLevel) {
    return null
  }

  return (
    <span
      className={cn("relative inline-flex size-7 shrink-0 items-center justify-center", className)}
      title={challenger ? "Challenger" : `Level ${data.rank.level}`}
    >
      {showChallenger ? (
        <ChallengerMark
          className="size-full object-contain"
          accentColor={getChallengerRankColor(data.rank.worldRank)}
        />
      ) : (
        <Image
          src={levelAsset(data)}
          alt=""
          className="size-full object-contain"
          width={28}
          height={28}
          unoptimized
        />
      )}
    </span>
  )
}
export function Identity({
  data,
  visibility,
  className,
}: {
  data: WidgetData
  visibility: WidgetVisibility
  className?: string
}) {
  if (!visibility.nickname && !visibility.level && !visibility.challenger) {
    return null
  }

  return (
    <div className={cn("flex min-w-0 items-center gap-2", className)}>
      <LevelMark data={data} visibility={visibility} />
      {visibility.nickname ? <PlayerNickname data={data} /> : null}
    </div>
  )
}

export function EloValue({
  data,
  visibility,
  className,
  valueClassName,
}: {
  data: WidgetData
  visibility: WidgetVisibility
  className?: string
  valueClassName?: string
}) {
  if (!visibility.elo) {
    return null
  }

  return (
    <span className={cn("inline-flex flex-col gap-[3px]", className)}>
      <strong
        className={cn(
          "whitespace-nowrap text-[20px] font-extrabold leading-none tracking-[-0.04em] text-[color:var(--widget-text)] tabular-nums",
          valueClassName,
        )}
      >
        <AnimatedNumber value={data.rank.elo} />
      </strong>
    </span>
  )
}

export function EloSummary({ data, visibility }: { data: WidgetData; visibility: WidgetVisibility }) {
  if (!visibility.elo) {
    return null
  }

  const eloChange = data.rank.eloChange

  return (
    <span className="inline-flex min-w-0 items-baseline gap-[3px] whitespace-nowrap text-[9px] leading-none text-[color:var(--widget-muted)]">
      <strong className="text-[9px] font-bold text-[color:var(--widget-text)] tabular-nums">
        <AnimatedNumber value={data.rank.elo} />
      </strong>
      <span>ELO</span>
      {hasEloChange(eloChange) ? (
        <span className={cn("tabular-nums", eloChange > 0 ? "text-[#83dba5]" : "text-[#ff7884]")}>
          (<AnimatedNumber value={eloChange} signed />)
        </span>
      ) : null}
    </span>
  )
}

export function RankValue({
  value,
  className,
  valueClassName,
}: {
  value?: number
  className?: string
  valueClassName?: string
}) {
  return (
    <span className={cn("inline-flex flex-col gap-[3px]", className)}>
      <strong
        className={cn(
          "text-[16px] font-extrabold leading-none text-[color:var(--widget-text)] tabular-nums",
          valueClassName,
        )}
      >
        #{formatNumber(value)}
      </strong>
    </span>
  )
}

type ChallengerRankTier = "gold" | "silver" | "bronze" | "top"

function challengerRankTier(value?: number): ChallengerRankTier {
  if (value === 1) {
    return "gold"
  }

  if (value === 2) {
    return "silver"
  }

  if (value === 3) {
    return "bronze"
  }

  return "top"
}

export function getChallengerRankColor(value?: number) {
  return CHALLENGER_RANK_COLORS[challengerRankTier(value)]
}

export function ChallengerRankBadge({
  value,
  showRankNumber = true,
}: {
  value?: number
  showRankNumber?: boolean
}) {
  const tier = challengerRankTier(value)
  const label = `#${formatNumber(value)}`
  const style = {
    "--challenger-rank-color": CHALLENGER_RANK_COLORS[tier],
  } as CSSProperties

  return (
    <span
      className={cn(
        showRankNumber
          ? "inline-flex min-h-7 shrink-0 items-center gap-[5px] rounded-full border border-[color:var(--challenger-rank-color)] bg-[color:var(--challenger-rank-color)] px-2 py-1 leading-none text-[#090909] shadow-[0_1px_0_rgb(0_0_0_/_28%)]"
          : "inline-flex size-7 shrink-0 items-center justify-center",
      )}
      style={style}
      title={`World rank ${label}`}
      aria-label={`World rank ${label}`}
    >
      {showRankNumber ? (
        <strong className="font-system text-[13px] font-extrabold text-[#090909] tabular-nums">{label}</strong>
      ) : null}
      <ChallengerMark
        className={cn("block shrink-0 object-contain", showRankNumber ? "size-5" : "size-7")}
        accentColor={CHALLENGER_RANK_COLORS[tier]}
      />
    </span>
  )
}

export function LevelRankBadge({
  data,
  visibility,
}: {
  data: WidgetData
  visibility: WidgetVisibility
}) {
  return (
    <span className="inline-flex min-h-7 shrink-0 items-center gap-[5px] rounded-full border border-[color:var(--widget-border)] bg-[color:var(--widget-surface-muted)] px-2 py-1 leading-none text-[color:var(--widget-text)] shadow-[0_1px_0_rgb(0_0_0_/_28%)]">
      <strong className="font-system text-[13px] font-extrabold tabular-nums">
        #{formatNumber(data.rank.level)}
      </strong>
      <LevelMark data={data} visibility={visibility} className="size-5" />
    </span>
  )
}

export function CountryFlag({
  data,
  className,
}: {
  data: WidgetData
  className?: string
}) {
  const code = data.profile.countryCode?.toLowerCase().replace(/[^a-z]/g, "")

  if (!code) {
    return null
  }

  return (
    <Image
      className={cn("block h-3.5 w-5 max-w-none shrink-0 rounded-[2px] object-contain", className)}
      src={`/flags/${code}.svg`}
      alt=""
      width={20}
      height={14}
      unoptimized
    />
  )
}
export function KdrValue({
  data,
  visibility,
  className,
  valueClassName,
  labelClassName,
}: {
  data: WidgetData
  visibility: WidgetVisibility
  className?: string
  valueClassName?: string
  labelClassName?: string
}) {
  if (!visibility.kdr) {
    return null
  }

  return (
    <span className={cn("inline-flex flex-col items-end gap-[3px]", className)}>
      <strong
        className={cn(
          "text-[18px] font-extrabold leading-none text-[color:var(--widget-text)] tabular-nums",
          valueClassName,
        )}
      >
        {formatNumber(data.lifetime?.kdr, 2)}
      </strong>
      <small
        className={cn(
          "text-[9px] font-bold uppercase leading-none tracking-[0.08em] text-[color:var(--widget-muted)]",
          labelClassName,
        )}
      >
        KDR
      </small>
    </span>
  )
}

const statValueStyles = {
  default: "text-[color:var(--widget-text)]",
  positive: "text-[#58d68d]",
  negative: "text-[#ff5b67]",
} as const

function Stat({
  label,
  value,
  tone = "default",
}: {
  label: string
  value: ReactNode
  tone?: keyof typeof statValueStyles
}) {
  return (
    <span className="flex min-w-0 flex-col gap-1">
      <strong
        className={cn(
          "whitespace-nowrap text-[15px] font-extrabold leading-none tabular-nums",
          statValueStyles[tone],
        )}
      >
        {value}
      </strong>
      <small className="whitespace-nowrap text-[8px] font-medium leading-[1.1] text-[color:var(--widget-muted)]">
        {label}
      </small>
    </span>
  )
}

function AnimatedMetricPair({
  first,
  second,
  secondFractionDigits = 1,
}: {
  first?: number
  second?: number
  secondFractionDigits?: number
}) {
  return (
    <>
      <AnimatedNumber value={first} />
      <span aria-hidden="true"> / </span>
      <AnimatedNumber value={second} maximumFractionDigits={secondFractionDigits} />
    </>
  )
}

function StatGrid({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("grid grid-cols-[repeat(3,minmax(0,1fr))] gap-[6px]", className)}>
      {children}
    </div>
  )
}

export function RecordStat({
  label,
  value,
  tone,
}: {
  label: string
  value?: number
  tone: "positive" | "negative"
}) {
  const toneStyles =
    tone === "positive"
      ? "border-[#00b85a] bg-[#00b85a]/10 text-[#73e6a5]"
      : "border-[#c9283c] bg-[#c9283c]/10 text-[#ff7884]"

  return (
    <span
      className={cn(
        "flex min-h-10 flex-col items-center justify-center gap-[3px] rounded-[5px] border bg-[color:var(--widget-surface)] px-[3px] py-1 shadow-[inset_0_1px_0_rgb(255_255_255_/_4%)]",
        toneStyles,
      )}
    >
      <strong className="text-[12px] font-extrabold leading-none tabular-nums">
        <AnimatedNumber value={value} />
      </strong>
      <small className="text-[7px] font-bold lowercase leading-none text-[color:var(--widget-muted)]">
        {label}
      </small>
    </span>
  )
}

export function TodayStats({ data }: { data: WidgetData }) {
  return (
    <StatGrid>
      <span className="grid min-w-16 grid-cols-2 gap-[10px]">
        <Stat label="Wins" value={<AnimatedNumber value={data.today?.wins} />} tone="positive" />
        <Stat label="Losses" value={<AnimatedNumber value={data.today?.losses} />} tone="negative" />
      </span>
      <Stat
        label="Avg. Kills / ADR"
        value={<AnimatedMetricPair first={data.today?.avgKills} second={data.today?.adr} />}
      />
      <Stat label="K/D" value={<AnimatedNumber value={data.today?.avgKD} maximumFractionDigits={2} />} />
    </StatGrid>
  )
}

export function Last30Stats({ data }: { data: WidgetData }) {
  return (
    <StatGrid>
      <Stat
        label="Win rate"
        value={<><AnimatedNumber value={data.last30?.winRate} />%</>}
        tone={getWinRateTone(data.last30?.winRate)}
      />
      <Stat
        label="Avg. Kills / ADR"
        value={<AnimatedMetricPair first={data.last30?.avgKills} second={data.last30?.adr} />}
      />
      <Stat
        label="K/D"
        value={<AnimatedNumber value={data.last30?.avgKD} maximumFractionDigits={2} />}
      />
    </StatGrid>
  )
}

export function PerformanceStats({ data }: { data: WidgetData }) {
  return (
    <StatGrid className="grid-cols-[repeat(4,minmax(0,1fr))]">
      <Stat label="AVG" value={<AnimatedNumber value={data.lifetime?.avgKills} maximumFractionDigits={2} />} />
      <Stat
        label="HS"
        value={<><AnimatedNumber value={data.lifetime?.headshotRate} maximumFractionDigits={1} />%</>}
      />
      <Stat label="K/D" value={<AnimatedNumber value={data.lifetime?.kdr} maximumFractionDigits={2} />} />
      <Stat label="K/R" value={<AnimatedNumber value={data.lifetime?.kr} maximumFractionDigits={2} />} />
    </StatGrid>
  )
}

const matchResultStyles = {
  win: "text-[#39d98a]",
  loss: "text-[#ef5265]",
} as const

export function LastFiveResults({ data }: { data: WidgetData }) {
  const results = data.last5Results?.slice(0, 5) ?? []

  if (results.length === 0) return null

  return (
    <div className="flex shrink-0 items-center gap-[3px]" aria-label="Last 5 matches">
      {results.map((result, index) => (
        <span
          key={`${result}-${index}`}
          className={cn("text-[9px] font-extrabold leading-none", matchResultStyles[result])}
          title={result === "win" ? "Win" : "Loss"}
        >
          {result === "win" ? "W" : "L"}
        </span>
      ))}
    </div>
  )
}

export function StatsPanel({
  title,
  children,
  className,
  labelClassName,
}: {
  title?: string
  children: ReactNode
  className?: string
  labelClassName?: string
}) {
  return (
    <section
      className={cn(
        "flex flex-col gap-[7px] border-t border-[color:var(--widget-border)] pt-[7px]",
        className,
      )}
      aria-label={title}
    >
      {title ? (
        <span
          className={cn(
            "text-[9px] font-bold uppercase leading-none tracking-[0.08em] text-[color:var(--widget-muted)]",
            labelClassName,
          )}
        >
          {title}
        </span>
      ) : null}
      {children}
    </section>
  )
}

function GlobeIcon() {
  return <Globe2 aria-hidden="true" className="size-3.5 shrink-0 text-white" />
}

function RankItem({
  label,
  value,
  icon,
  className,
  valueClassName,
}: {
  label: string
  value?: number
  icon: ReactNode
  className?: string
  valueClassName?: string
}) {
  return (
    <span className={cn("inline-flex items-center gap-1", className)} title={label}>
      {icon}
      <RankValue className="gap-0" value={value} valueClassName={valueClassName} />
    </span>
  )
}

export function WorldRank({
  data,
  visibility,
  showChallengerBadge = true,
  className,
  valueClassName,
}: {
  data: WidgetData
  visibility: WidgetVisibility
  showChallengerBadge?: boolean
  className?: string
  valueClassName?: string
}) {
  if (!visibility.worldRank) {
    return null
  }

  if (showChallengerBadge && visibility.challenger && isChallengerRank(data.rank)) {
    return <ChallengerRankBadge value={data.rank.worldRank} showRankNumber={visibility.challengerRank} />
  }

  return (
    <RankItem
      label="World rank"
      value={data.rank.worldRank}
      icon={<GlobeIcon />}
      className={className}
      valueClassName={valueClassName}
    />
  )
}
export function CountryRank({
  data,
  visibility,
  className,
  flagClassName,
  valueClassName,
}: {
  data: WidgetData
  visibility: WidgetVisibility
  className?: string
  flagClassName?: string
  valueClassName?: string
}) {
  if (!visibility.countryRank) {
    return null
  }

  return (
    <RankItem
      label="Country rank"
      value={data.rank.countryRank}
      icon={<CountryFlag data={data} className={flagClassName} />}
      className={cn("gap-[5px]", className)}
      valueClassName={valueClassName}
    />
  )
}
