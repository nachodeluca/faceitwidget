import Link from "next/link"
import { BarChart3, SlidersHorizontal, Trophy } from "lucide-react"

import { FaqAccordion } from "@/components/home/faq-accordion"
import { APP_PATHS, SITE_PATHS } from "@/lib/site-metadata"

export function HomeStory() {
  return (
    <section aria-labelledby="story-title" className="relative">
      <div className="mx-auto w-full max-w-[960px] px-4 pt-24 text-center sm:px-6 sm:pt-32 lg:px-10 lg:pt-40">
        <div className="mx-auto max-w-3xl">
          <h2
            id="story-title"
            className="mx-auto max-w-3xl text-3xl font-semibold leading-[1.05] tracking-[-0.05em] text-foreground sm:text-5xl"
          >
            FACEIT stats for OBS, without a plugin.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
            Keep the overlay readable, quiet, and ready for the next round. Set it up once, then let the stats follow the game.
          </p>
          <div className="mx-auto mt-10 max-w-3xl space-y-4">
          <p className="text-sm leading-7 text-muted-foreground sm:text-base">
            <strong className="font-semibold text-foreground">FACEIT Widget is a free CS2 statistics overlay for OBS and Streamlabs.</strong>{" "}
            It turns a public FACEIT nickname into a browser-source URL that can show ELO, level, rank, country, K/D, and recent match results on a live stream.
          </p>
          <p className="text-sm leading-7 text-muted-foreground sm:text-base">
            The widget does not require a FACEIT password, plugin, or account login. Open the <Link className="text-foreground underline underline-offset-4" href={APP_PATHS.builder}>widget builder</Link>, choose a preset, adjust the layout, and copy the URL into an OBS Browser source.
          </p>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[1440px] px-4 pb-28 sm:px-6 sm:pb-40 lg:px-10">
        <div className="mx-auto mt-20 max-w-5xl text-center sm:mt-24">
          <h2 className="mx-auto text-2xl font-semibold leading-tight tracking-[-0.04em] text-foreground sm:text-3xl">
            Choose the information your viewers need.
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
            Each preset is designed for a different amount of space in your scene. You can keep the compact ELO pill, combine rank and country, or use a larger profile card with more context.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <article className="h-full min-h-[240px] rounded-xl border border-border bg-secondary p-6 text-center shadow-[inset_0_1px_rgb(255_255_255_/_5%)]">
              <div className="mx-auto flex size-12 items-center justify-center rounded-xl border border-border-strong bg-background/45 text-foreground">
                <Trophy aria-hidden="true" className="size-6" strokeWidth={1.7} />
              </div>
              <h3 className="mt-6 text-xl font-semibold text-foreground">Rank and ELO</h3>
              <p className="mt-3 text-base leading-7 text-muted-foreground">
                Show current ELO, FACEIT level, Challenger status, world rank, and country rank in a small footprint.
              </p>
            </article>
            <article className="h-full min-h-[240px] rounded-xl border border-border bg-secondary p-6 text-center shadow-[inset_0_1px_rgb(255_255_255_/_5%)]">
              <div className="mx-auto flex size-12 items-center justify-center rounded-xl border border-border-strong bg-background/45 text-foreground">
                <BarChart3 aria-hidden="true" className="size-6" strokeWidth={1.7} />
              </div>
              <h3 className="mt-6 text-xl font-semibold text-foreground">Match statistics</h3>
              <p className="mt-3 text-base leading-7 text-muted-foreground">
                Add K/D, wins and losses for today, recent form, or averages from the latest 30 completed matches.
              </p>
            </article>
            <article className="h-full min-h-[240px] rounded-xl border border-border bg-secondary p-6 text-center shadow-[inset_0_1px_rgb(255_255_255_/_5%)]">
              <div className="mx-auto flex size-12 items-center justify-center rounded-xl border border-border-strong bg-background/45 text-foreground">
                <SlidersHorizontal aria-hidden="true" className="size-6" strokeWidth={1.7} />
              </div>
              <h3 className="mt-6 text-xl font-semibold text-foreground">A layout that fits</h3>
              <p className="mt-3 text-base leading-7 text-muted-foreground">
                Change visible fields, colors, scale, radius, border, background, and motion before you add the source to OBS.
              </p>
            </article>
          </div>

          <h2 className="mx-auto mt-20 text-2xl font-semibold leading-tight tracking-[-0.04em] text-foreground sm:text-3xl">
            How to create a FACEIT Widget
          </h2>
          <ol className="mx-auto mt-5 max-w-2xl list-inside list-decimal space-y-3 text-sm leading-7 text-muted-foreground sm:text-base">
            <li>Enter the exact public FACEIT nickname in the <Link className="text-foreground underline underline-offset-4" href={APP_PATHS.builder}>builder</Link>.</li>
            <li>Select a preset and turn the fields you want on or off.</li>
            <li>Adjust the visual settings and wait for the preview to load.</li>
            <li>Copy the generated URL and add it as a Browser source in OBS or Streamlabs.</li>
          </ol>

          <h2 className="mx-auto mt-20 text-2xl font-semibold leading-tight tracking-[-0.04em] text-foreground sm:text-3xl">
            How live updates work
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">
            FACEIT Widget reads public player statistics and checks for changed values about every two minutes while the browser source is open. After a match, FACEIT may need time to publish the completed result. The previous values remain visible until newer data is available. The <Link className="text-foreground underline underline-offset-4" href={SITE_PATHS.liveFaceitStatsGuide}>live stats guide</Link> explains what each refresh can update.
          </p>

          <h2 className="mx-auto mt-20 text-2xl font-semibold leading-tight tracking-[-0.04em] text-foreground sm:text-3xl">
            Common questions
          </h2>
          <FaqAccordion />
        </div>
      </div>
    </section>
  )
}
