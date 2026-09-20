"use client"

import { ChevronDown } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

import { SITE_PATHS } from "@/lib/site-metadata"
import { SITE_LINKS } from "@/lib/site-links"
import { cn } from "@/lib/utils"

const FAQS = [
  {
    id: "obs-streamlabs",
    question: "Does it work with OBS and Streamlabs?",
    answer: (
      <>
        Yes. The generated page is intended for a Browser source, so it works in OBS Studio and Streamlabs Desktop without installing a separate plugin. Follow the{" "}
        <Link className="text-foreground underline underline-offset-4" href={SITE_PATHS.faceitWidgetObsGuide}>
          OBS setup guide
        </Link>{" "}
        for the recommended source settings.
      </>
    ),
  },
  {
    id: "account",
    question: "Does FACEIT Widget need my account?",
    answer:
      "No. It uses the public statistics associated with the nickname you enter. Do not put passwords, API keys, or private tokens in the URL or in a support request.",
  },
  {
    id: "open-source",
    question: "Is FACEIT Widget open source?",
    answer: (
      <>
        Yes. FACEIT Widget is an independent open-source community project. You can inspect the source code, report bugs, suggest improvements, and propose changes in the{" "}
        <a target="_blank" rel="noreferrer" className="text-foreground underline underline-offset-4" href={SITE_LINKS.github}>
          public GitHub repository
        </a>
        . It is not affiliated with FACEIT.
      </>
    ),
  },
] as const

export function FaqAccordion() {
  const [openId, setOpenId] = useState<string | null>(null)

  return (
    <div className="mx-auto mt-8 max-w-3xl space-y-3">
      {FAQS.map((faq) => {
        const open = openId === faq.id
        const triggerId = `${faq.id}-trigger`
        const panelId = `${faq.id}-panel`

        return (
          <article
            key={faq.id}
            className={cn(
              "overflow-hidden rounded-xl border border-border/70 bg-secondary/60 shadow-[inset_0_1px_rgb(255_255_255_/_3%)]",
              open && "bg-secondary/80",
            )}
          >
            <button
              id={triggerId}
              type="button"
              aria-expanded={open}
              aria-controls={panelId}
              className="relative flex w-full items-center justify-center gap-5 px-12 py-4 text-center text-base font-semibold text-foreground outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/60"
              onClick={() => setOpenId(open ? null : faq.id)}
            >
              <span>{faq.question}</span>
              <ChevronDown
                aria-hidden="true"
                className={cn(
                  "absolute right-5 size-5 shrink-0 text-muted-foreground transition-transform duration-[220ms] ease-[var(--ease-out)] motion-reduce:transition-none",
                  open && "rotate-180",
                )}
              />
            </button>
            <div
              id={panelId}
              role="region"
              aria-labelledby={triggerId}
              aria-hidden={!open}
              inert={!open}
              className={cn(
                "grid transition-[grid-template-rows] duration-[220ms] ease-[var(--ease-out)] motion-reduce:transition-none",
                open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
              )}
            >
              <div className="min-h-0 overflow-hidden">
                <p className="border-t border-border/70 px-5 pb-5 pt-4 text-center text-sm leading-7 text-muted-foreground sm:text-base">
                  {faq.answer}
                </p>
              </div>
            </div>
          </article>
        )
      })}
    </div>
  )
}
