import type { ReactNode } from "react"

import { SitePage } from "@/components/site/site-page"

type GuidePageProps = {
  title: string
  description: string
  path: string
  children: ReactNode
}

export function GuidePage({ title, description, path, children }: GuidePageProps) {
  return (
    <SitePage title={title} description={description} path={path} showBuilderCta>
      {children}
    </SitePage>
  )
}
