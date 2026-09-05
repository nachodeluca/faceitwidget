const STORY_PARAGRAPHS = [
  "FACEIT Widget is a free browser-source overlay for OBS and Streamlabs. It turns public FACEIT CS2 statistics into a compact layer for your stream, with no plugin and no FACEIT login.",
  "Choose a preset for ELO, level, rankings, K/D, recent results, or match stats, then copy the generated URL into a Browser Source. Change the fields, colors, scale, radius, border, background, and motion in the builder and see the result before you add it to your scene. When new match data is available, the overlay updates while the source stays open.",
]

export function HomeStory() {
  return (
    <section
      aria-labelledby="story-title"
      className="relative"
    >
      <div className="mx-auto grid w-full max-w-[1440px] items-start gap-10 px-4 pt-24 sm:px-6 sm:pt-32 lg:grid-cols-[minmax(220px,0.7fr)_minmax(0,1.3fr)] lg:gap-20 lg:px-10 lg:pt-40">
        <div className="max-w-xl lg:pt-12">
          <h2
            id="story-title"
            className="max-w-lg text-3xl font-semibold leading-[1.05] tracking-[-0.05em] text-foreground sm:text-5xl"
          >
            Your numbers belong in the frame.
          </h2>
          <p className="mt-5 max-w-md text-sm leading-6 text-muted-foreground sm:text-base">
            Keep the overlay readable, quiet, and ready for the next round. Set it up once, then let the stats follow the game.
          </p>
        </div>

        <div className="max-w-2xl space-y-4 lg:pt-12">
          {STORY_PARAGRAPHS.map((paragraph) => (
            <p
              key={paragraph}
              className="text-sm leading-7 text-muted-foreground sm:text-base"
            >
              {paragraph}
            </p>
          ))}
        </div>
      </div>

      <div className="mx-auto w-full max-w-[1440px] px-4 pb-28 sm:px-6 sm:pb-40 lg:px-10">
        <div className="mt-20 max-w-xl sm:mt-24">
          <h2 className="text-2xl font-semibold leading-tight tracking-[-0.04em] text-foreground sm:text-3xl">
            Set the details. Keep your scene clean.
          </h2>
          <p className="mt-4 text-sm leading-6 text-muted-foreground sm:text-base">
            Start with a preset, remove the fields you do not need, and tune the overlay to fit the space beside your game.
          </p>
        </div>
      </div>
    </section>
  )
}
