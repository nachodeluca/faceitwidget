import type { ReactNode } from "react"
import { Heart } from "lucide-react"
import Link from "next/link"

import { GithubMark } from "@/components/icons/github-mark"
import { SITE_NAV_LINK_CLASS } from "@/components/site/link-styles"
import { SITE_PATHS } from "@/lib/site-metadata"
import { SITE_LINKS } from "@/lib/site-links"

function FooterLink({
  href,
  icon,
  children,
}: {
  href: string
  icon: ReactNode
  children: ReactNode
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="group inline-flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground outline-none transition-[background-color,color] duration-150 ease-[var(--ease-out)] hover:bg-control-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/60"
    >
      {icon}
      {children}
    </a>
  )
}

export function SiteFooter() {
  return (
    <footer className="relative z-20 flex justify-center pb-5 sm:pb-6 lg:absolute lg:inset-x-0 lg:bottom-0">
      <div className="flex flex-col items-center gap-0.5">
        <div className="flex items-center justify-center gap-1">
          <FooterLink
            href={SITE_LINKS.github}
            icon={<GithubMark className="transition-transform duration-150 ease-[var(--ease-out)] [@media(hover:hover)_and_(pointer:fine)]:group-hover:rotate-[-8deg]" />}
          >
            GitHub
          </FooterLink>
          <FooterLink
            href={SITE_LINKS.support}
            icon={<Heart className="size-3.5 transition-[color,fill] duration-150 ease-[var(--ease-out)] [@media(hover:hover)_and_(pointer:fine)]:group-hover:fill-current" />}
          >
            Support us
          </FooterLink>
        </div>
        <nav aria-label="Site information" className="flex items-center gap-3 text-[10px] text-text-muted">
          <Link href={SITE_PATHS.contact} className={SITE_NAV_LINK_CLASS}>Contact</Link>
          <Link href={SITE_PATHS.privacy} className={SITE_NAV_LINK_CLASS}>Privacy</Link>
        </nav>
        <p className="text-center text-[10px] text-text-muted">Unofficial community project. Not affiliated with FACEIT.</p>
      </div>
    </footer>
  )
}
