export function formatNumber(value: number | undefined, maximumFractionDigits = 0) {
  if (value === undefined || !Number.isFinite(value)) {
    return "\u2014"
  }

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits,
    minimumFractionDigits: 0,
  }).format(value)
}

export function formatRankNumber(value: number | undefined) {
  if (value === undefined || !Number.isFinite(value)) {
    return "\u2014"
  }

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
    useGrouping: false,
  }).format(value)
}
