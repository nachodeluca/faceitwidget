export function formatNumber(value: number | undefined, maximumFractionDigits = 0) {
  if (value === undefined || !Number.isFinite(value)) {
    return "\u2014"
  }

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits,
    minimumFractionDigits: maximumFractionDigits,
  }).format(value)
}
