import { cn } from "@/lib/utils"
import { AnimatedNumber } from "../../animated-number"

function hasValue(value?: number) {
  return typeof value === "number" && Number.isFinite(value)
}

export type PerformanceMetricProps = {
  label: string
  value?: number
  maximumFractionDigits?: number
  suffix?: string
  className?: string
  valueClassName?: string
  labelClassName?: string
}

export function PerformanceMetric({
  label,
  value,
  maximumFractionDigits = 0,
  suffix,
  className,
  valueClassName,
  labelClassName,
}: PerformanceMetricProps) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-[4px]", className)}>
      <strong
        className={cn(
          "whitespace-nowrap text-[15px] font-extrabold leading-none tracking-[-0.02em] text-[color:var(--widget-text)] tabular-nums",
          valueClassName,
        )}
      >
        <AnimatedNumber value={value} maximumFractionDigits={maximumFractionDigits} />
        {suffix && hasValue(value) ? suffix : null}
      </strong>
      <span
        className={cn(
          "whitespace-nowrap text-[8px] font-bold uppercase leading-none tracking-[0.04em] text-[color:var(--widget-muted)]",
          labelClassName,
        )}
      >
        {label}
      </span>
    </div>
  )
}
