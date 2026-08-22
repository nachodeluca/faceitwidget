import Image from "next/image"
import Link from "next/link"

import { SITE_PATHS } from "@/lib/site-metadata"

const recoveryLinkClass =
  "relative text-sm text-muted-foreground transition-colors after:absolute after:inset-x-0 after:bottom-0 after:h-px after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-200 hover:text-foreground hover:after:scale-x-100 motion-reduce:after:transition-none"

export default function NotFound() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen w-full max-w-[760px] flex-col items-center justify-center px-5 py-10 text-center sm:px-8">
        <Link
          href={SITE_PATHS.home}
          aria-label="FACEIT Widget home"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <Image src="/logo.svg" alt="" width={22} height={22} priority />
          <span>FACEIT Widget</span>
        </Link>
        <p className="mt-16 text-sm font-medium tracking-[0.18em] text-muted-foreground">404</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">Page not found</h1>
        <p className="mx-auto mt-5 max-w-[520px] text-base leading-7 text-muted-foreground">
          This URL is not part of the public site. Use one of the links below to find the widget, documentation, or machine-readable site files.
        </p>
        <nav aria-label="Recovery links" className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-3">
          <Link className={recoveryLinkClass} href={SITE_PATHS.home}>Homepage</Link>
          <Link className={recoveryLinkClass} href="/builder/">Widget builder</Link>
          <Link className={recoveryLinkClass} href={SITE_PATHS.faceitWidgetObsGuide}>OBS setup</Link>
          <Link className={recoveryLinkClass} href={SITE_PATHS.liveFaceitStatsGuide}>Live stats</Link>
          <Link className={recoveryLinkClass} href="/sitemap.xml">Sitemap</Link>
          <Link className={recoveryLinkClass} href="/llms.txt">llms.txt</Link>
        </nav>
      </div>
    </main>
  )
}
