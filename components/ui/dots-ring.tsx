import { cn } from "@/lib/utils"

const DOT_COUNT = 8
const DOT_STEP_DEGREES = 45
const DOT_DELAY_MS = 150

type DotsRingProps = {
  className?: string
  label?: string
  decorative?: boolean
}

export function DotsRing({
  className,
  label = "Loading",
  decorative = false,
}: DotsRingProps) {
  return (
    <span
      aria-hidden={decorative || undefined}
      aria-label={decorative ? undefined : label}
      className={cn("relative block size-12", className)}
      role={decorative ? undefined : "status"}
    >
      {Array.from({ length: DOT_COUNT }, (_, index) => (
        <span
          aria-hidden="true"
          className="absolute inset-0 origin-center"
          key={index}
          style={{ transform: `rotate(${index * DOT_STEP_DEGREES}deg)` }}
        >
          <span
            className="absolute top-0 left-1/2 size-2 -translate-x-1/2 rounded-full bg-current motion-safe:animate-[dots-ring_1.5s_ease-in-out_infinite] motion-reduce:animate-none"
            style={{ animationDelay: `${index * DOT_DELAY_MS}ms` }}
          />
        </span>
      ))}
    </span>
  )
}
