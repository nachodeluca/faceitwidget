import Image from "next/image"

import { cn } from "@/lib/utils"

export const GUIDE_IMAGES = {
  builderSettings: { src: "/guides/faceit-widget-builder-settings.webp", width: 351, height: 910 },
  copyUrl: { src: "/guides/faceit-widget-copy-url.webp", width: 1538, height: 913 },
  liveStats: { src: "/guides/live-stats-rich-profile.webp", width: 1892, height: 915 },
  addBrowserSource: { src: "/guides/obs-add-browser-source.webp", width: 1039, height: 649 },
  browserSettings: { src: "/guides/obs-browser-source-settings.webp", width: 1273, height: 991 },
  widgetOverlay: { src: "/guides/obs-widget-overlay.webp", width: 1278, height: 991 },
} as const

type GuideImageProps = {
  image: (typeof GUIDE_IMAGES)[keyof typeof GUIDE_IMAGES]
  alt: string
  caption: string
  compact?: boolean
}

export function GuideImage({ image, alt, caption, compact = false }: GuideImageProps) {
  return (
    <figure className={cn("my-8", compact && "mx-auto max-w-[351px]")}>
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <Image
          src={image.src}
          alt={alt}
          width={image.width}
          height={image.height}
          sizes={compact ? "351px" : "(min-width: 768px) 696px, calc(100vw - 40px)"}
          className="block h-auto w-full"
        />
      </div>
      <figcaption className="mt-3 text-center text-xs leading-5 text-muted-foreground">
        {caption}
      </figcaption>
    </figure>
  )
}
