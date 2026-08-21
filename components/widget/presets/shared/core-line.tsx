import {
  isChallengerRank,
  type WidgetConfig,
  type WidgetData,
} from "@/lib/widget"
import { cn } from "@/lib/utils"

import {
  ChallengerRankBadge,
  EloValue,
  LevelMark,
  LevelRankBadge,
} from "../../parts"
import type { PresetViewProps } from "../types"

export function showsChallengerWorldRank(data: WidgetData, config: WidgetConfig) {
  return config.visibility.worldRank
    && config.visibility.challenger
    && isChallengerRank(data.rank)
}

export function showsChallengerFocusRank(data: WidgetData, config: WidgetConfig) {
  return !config.visibility.worldRank
    && config.visibility.challenger
    && config.visibility.challengerRank
    && isChallengerRank(data.rank)
}

type CoreLineProps = PresetViewProps & {
  className?: string
  levelClassName?: string
  eloValueClassName?: string
  hideChallengerMark?: boolean
  showFocusRank?: boolean
}

export function CoreLine({
  data,
  config,
  className,
  levelClassName,
  eloValueClassName,
  hideChallengerMark = false,
  showFocusRank = false,
}: CoreLineProps) {
  const challenger = isChallengerRank(data.rank)
  const showChallengerRankBadge = showFocusRank && challenger && config.visibility.challenger
  const showLevelRankBadge = showFocusRank && !challenger && config.visibility.level

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {showChallengerRankBadge ? (
        <ChallengerRankBadge
          value={data.rank.worldRank}
          showRankNumber={config.visibility.challengerRank}
        />
      ) : showLevelRankBadge ? (
        <LevelRankBadge data={data} visibility={config.visibility} />
      ) : !(hideChallengerMark && challenger) ? (
        <LevelMark data={data} visibility={config.visibility} className={levelClassName} />
      ) : null}
      <EloValue data={data} visibility={config.visibility} valueClassName={eloValueClassName} />
    </div>
  )
}
