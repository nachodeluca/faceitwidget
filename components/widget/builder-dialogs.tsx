import { ArrowUpRight, Bug, Check, Copy, Heart, Lightbulb } from "lucide-react"
import Link from "next/link"
import type { ReactNode, SyntheticEvent } from "react"

import { GithubMark } from "@/components/icons/github-mark"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SITE_LINKS } from "@/lib/site-links"
import { SITE_PATHS } from "@/lib/site-metadata"

type CopyDialogProps = {
  open: boolean
  widgetUrl: string
  copied: boolean
  onOpenChange: (open: boolean) => void
  onCopy: () => void
}

function showUrlStart(event: SyntheticEvent<HTMLInputElement>) {
  event.currentTarget.scrollLeft = 0
}

function CopyDialog({ open, widgetUrl, copied, onOpenChange, onCopy }: CopyDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Use your widget</DialogTitle>
          <DialogDescription>
            Copy this URL to use the widget in OBS, a browser source, or anywhere else.
          </DialogDescription>
          <p className="text-xs text-muted-foreground">
            Need help adding it to OBS?{" "}
            <Link
              href={SITE_PATHS.faceitWidgetObsGuide}
              className="text-foreground underline decoration-border-strong underline-offset-4 transition-colors hover:decoration-foreground"
            >
              Read the setup guide
            </Link>
          </p>
        </DialogHeader>

        <div className="flex flex-col gap-2">
          <Label className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground" htmlFor="widget-url">
            Widget URL
          </Label>
          <div className="flex min-w-0 gap-2">
            <Input
              id="widget-url"
              readOnly
              value={widgetUrl}
              dir="ltr"
              onClick={showUrlStart}
              onFocus={showUrlStart}
              className="h-10 min-w-0 flex-1 truncate bg-background/60 text-left text-xs [direction:ltr] focus-visible:border-input focus-visible:ring-0"
            />
            <Button
              className="h-10 rounded-lg font-semibold shadow-[0_1px_0_rgb(0_0_0_/_18%)]"
              size="default"
              icon={copied ? <Check className="text-emerald-500" /> : <Copy />}
              iconPosition="end"
              onClick={onCopy}
            >
              {copied ? "Copied" : "Copy URL"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 border-t border-border/70 pt-4">
          <ExternalLink href={SITE_LINKS.support} icon={<Heart />}>
            Support us
          </ExternalLink>
          <ExternalLink href={SITE_LINKS.github} icon={<GithubMark />}>
            We&apos;re open source!
          </ExternalLink>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function ExternalLink({
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
      className="group inline-flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-muted-foreground outline-none transition-[background-color,color] duration-150 ease-[var(--ease-out)] hover:bg-control-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/60"
    >
      {icon}
      <span>{children}</span>
    </a>
  )
}

type FeedbackDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function FeedbackDialog({ open, onOpenChange }: FeedbackDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Share your feedback</DialogTitle>
          <DialogDescription>Suggest an idea or report a problem through GitHub.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-2 sm:grid-cols-2">
          <FeedbackLink href={SITE_LINKS.suggestIdea} icon={<Lightbulb />}>
            Suggest an idea
          </FeedbackLink>
          <FeedbackLink href={SITE_LINKS.bugReport} icon={<Bug />}>
            Report a bug
          </FeedbackLink>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function FeedbackLink({
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
      className="group flex min-h-[126px] flex-col rounded-lg border border-border bg-background/45 p-3.5 text-left outline-none transition-[background-color,border-color,transform] duration-150 ease-[var(--ease-out)] hover:border-border-strong hover:bg-control-hover focus-visible:ring-2 focus-visible:ring-ring/60 active:scale-[0.98]"
    >
      <div className="flex items-center justify-between">
        <span className="flex size-8 items-center justify-center rounded-md bg-control-selected text-foreground">
          {icon}
        </span>
        <ArrowUpRight
          aria-hidden="true"
          className="size-4 text-muted-foreground transition-transform duration-150 ease-[var(--ease-out)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
        />
      </div>
      <span className="mt-auto pt-5 text-sm font-semibold text-foreground">{children}</span>
    </a>
  )
}

type BuilderDialogsProps = {
  copyOpen: boolean
  feedbackOpen: boolean
  widgetUrl: string
  copied: boolean
  onCopyDialogChange: (open: boolean) => void
  onFeedbackDialogChange: (open: boolean) => void
  onCopy: () => void
}

export function BuilderDialogs({
  copyOpen,
  feedbackOpen,
  widgetUrl,
  copied,
  onCopyDialogChange,
  onFeedbackDialogChange,
  onCopy,
}: BuilderDialogsProps) {
  return (
    <>
      <CopyDialog
        open={copyOpen}
        widgetUrl={widgetUrl}
        copied={copied}
        onOpenChange={onCopyDialogChange}
        onCopy={onCopy}
      />
      <FeedbackDialog open={feedbackOpen} onOpenChange={onFeedbackDialogChange} />
    </>
  )
}
