"use client"

import dynamic from "next/dynamic"

import { ShowcaseSkeleton } from "./showcase-skeleton"

const LiveShowcase = dynamic(
  () => import("./live-showcase").then((module) => module.LiveShowcase),
  {
    loading: () => <ShowcaseSkeleton />,
    ssr: false,
  },
)

type ShowcaseProps = {
  nickname: string
}

export function Showcase({ nickname }: ShowcaseProps) {
  return <LiveShowcase nickname={nickname} />
}
