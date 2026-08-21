import Link from "next/link"
import { ArrowLeft, ArrowRight } from "lucide-react"
import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import { SITE_METADATA } from "@/lib/site-metadata"

type GuidePageProps = {
  title: string
  description: string
  path: string
  children: ReactNode
}

export function GuidePage({ title, description, path, children }: GuidePageProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "FACEIT Widget", item: SITE_METADATA.url },
      {
        "@type": "ListItem",
        position: 2,
        name: title,
        item: `${SITE_METADATA.url}${path}`,
      },
    ],
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replaceAll("<", "\\u003c") }}
      />
      <article className="mx-auto w-full max-w-[760px] px-5 py-10 sm:px-8 sm:py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          FACEIT Widget
        </Link>

        <header className="mt-12 border-b border-border pb-10">
          <h1 className="text-4xl font-semibold leading-tight tracking-[-0.045em] sm:text-5xl">{title}</h1>
          <p className="mt-5 max-w-[640px] text-base leading-7 text-muted-foreground">{description}</p>
        </header>

        <div className="py-10 text-[15px] leading-7 text-muted-foreground [&_a]:text-foreground [&_a]:underline [&_a]:underline-offset-4 [&_h2]:mb-4 [&_h2]:mt-10 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:tracking-[-0.025em] [&_h2]:text-foreground [&_li]:pl-2 [&_ol]:my-5 [&_ol]:list-decimal [&_ol]:space-y-3 [&_ol]:pl-5 [&_p+p]:mt-4 [&_strong]:font-semibold [&_strong]:text-foreground [&_ul]:my-5 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5">
          {children}
        </div>

        <footer className="border-t border-border pt-8">
          <p className="text-sm leading-6 text-muted-foreground">
            FACEIT Widget is an unofficial community project and is not affiliated with FACEIT.
          </p>
          <Button
            render={<Link href="/builder/?nickname=donk666" />}
            nativeButton={false}
            className="mt-5"
            icon={<ArrowRight />}
            iconPosition="end"
          >
            Create your widget
          </Button>
        </footer>
      </article>
    </main>
  )
}
