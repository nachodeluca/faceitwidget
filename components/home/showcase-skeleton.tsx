import { WidgetSkeleton } from "../widget/widget-placeholder"

import { SHOWCASE_ITEMS } from "./showcase-layout"

export function ShowcaseSkeleton() {
  return (
    <div aria-label="Loading live widget previews" role="status">
      {SHOWCASE_ITEMS.map(({ preset, className, size }) => (
        <WidgetSkeleton key={preset} className={className} size={size} />
      ))}
    </div>
  )
}
