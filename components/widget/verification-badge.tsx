import { useId } from "react"
import { cn } from "@/lib/utils"
import type { VerifiedBadgeType } from "@/lib/widget"

type BadgeIconProps = {
  className?: string
}

type VerificationBadgeProps = BadgeIconProps & {
  type: Exclude<VerifiedBadgeType, "none">
}

const badgePath =
  "M5 5h4l3-3 3 3h4v4l3 3-3 3v4h-4l-3 3-3-3H5v-4l-3-3 3-3zm6.098 11.737-5.414-5.684 5.414 1.894 7.218-5.684z"

export function VerificationBadge({ type, className }: VerificationBadgeProps) {
  return type === "gold" ? (
    <GoldVerificationBadge className={className} />
  ) : (
    <WhiteVerificationBadge className={className} />
  )
}

export function WhiteVerificationBadge({ className }: BadgeIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      role="img"
      aria-label="FACEIT verified badge"
      className={cn("size-3.5 shrink-0 text-white", className)}
    >
      <path fill="currentColor" fillRule="evenodd" clipRule="evenodd" d={badgePath} />
    </svg>
  )
}

export function GoldVerificationBadge({ className }: BadgeIconProps) {
  const generatedId = useId().replace(/[^a-zA-Z0-9_-]/g, "")
  const baseGradientId = `faceit-gold-base-${generatedId}`
  const maskGradientId = `faceit-gold-mask-${generatedId}`
  const maskId = `faceit-gold-shape-${generatedId}`
  const shineGradientId = `faceit-gold-shine-${generatedId}`

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      role="img"
      aria-label="FACEIT gold verification badge"
      className={cn("size-3.5 shrink-0", className)}
    >
      <path fill={`url(#${baseGradientId})`} fillRule="evenodd" clipRule="evenodd" d={badgePath} />
      <mask
        id={maskId}
        width="20"
        height="20"
        x="2"
        y="2"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <path
          fill={`url(#${maskGradientId})`}
          fillRule="evenodd"
          clipRule="evenodd"
          d={badgePath}
        />
      </mask>
      <g mask={`url(#${maskId})`}>
        <path
          fill={`url(#${shineGradientId})`}
          d="M25.678.178c-9.964-5.37-19.835-1.61-23.525.941l.062 2.252C8.272 10.572 17.682 14.05 21.63 14.887c4.416-6.392 4.539-12.47 4.048-14.71"
        />
      </g>
      <defs>
        <linearGradient
          id={baseGradientId}
          x1="12"
          x2="12"
          y1="2"
          y2="22"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#ffffb4" />
          <stop offset="1" stopColor="#f4982f" />
        </linearGradient>
        <linearGradient
          id={maskGradientId}
          x1="12"
          x2="12"
          y1="2"
          y2="22"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#ffffb4" />
          <stop offset="1" stopColor="#f4982f" />
        </linearGradient>
        <linearGradient
          id={shineGradientId}
          x1="13.899"
          x2="14.385"
          y1="-2.538"
          y2="15.087"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#fff" stopOpacity=".35" />
        </linearGradient>
      </defs>
    </svg>
  )
}
