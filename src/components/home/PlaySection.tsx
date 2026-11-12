import { lazy, type ReactNode, Suspense, useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { FACTORY_SOUNDS } from '../../synth/factory'

const DemoPlayer = lazy(() => import('./DemoPlayer'))

/** How long after load to fetch the player anyway, where there's no requestIdleCallback. */
const IDLE_FALLBACK = 1500

interface PlaySectionProps {
  /** Below the keyboard: e.g. a link to the full synth (a slot, so this renders without a router). */
  footer?: ReactNode
}

/**
 * "Play it here": sound chips and a keyboard on the home page. The page is prerendered and the
 * keyboard needs audio code and Motion, so it shows a placeholder first and loads the player
 * once the page is idle or the section is about to scroll into view, whichever comes first.
 */
const PlaySection = ({ footer }: PlaySectionProps) => {
  const section = useRef<HTMLElement>(null)
  const [sound, setSound] = useState(0)
  const [load, setLoad] = useState(false)

  useEffect(() => {
    const start = () => setLoad(true)
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) start()
      },
      { rootMargin: '400px' },
    )
    if (section.current) observer.observe(section.current)
    // Safari has no requestIdleCallback.
    const cancelIdle =
      typeof requestIdleCallback === 'function'
        ? cancelling(requestIdleCallback(start, { timeout: 3000 }), cancelIdleCallback)
        : cancelling(setTimeout(start, IDLE_FALLBACK), clearTimeout)
    return () => {
      observer.disconnect()
      cancelIdle()
    }
  }, [])

  const settings = (FACTORY_SOUNDS[sound] ?? FACTORY_SOUNDS[0])?.settings

  return (
    <section
      ref={section}
      id="play"
      aria-labelledby="play-heading"
      className="mx-auto w-full max-w-5xl scroll-mt-20 px-4 pb-20"
    >
      {/* Edge to edge on phones, so a whole octave of finger-sized keys fits on a 360 px screen. */}
      <div className="overflow-hidden rounded-2xl border bg-card shadow-xl max-sm:-mx-4 max-sm:rounded-none max-sm:border-x-0">
        <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <h2 id="play-heading" className="font-heading text-xl font-semibold">
            Play it here
          </h2>
          <fieldset className="flex flex-wrap gap-2">
            <legend className="sr-only">Sound</legend>
            {FACTORY_SOUNDS.map(({ name }, index) => (
              <label
                key={name}
                className={cn(
                  'flex min-h-11 cursor-pointer items-center rounded-full border px-4 text-sm font-medium transition-colors has-focus-visible:ring-3 has-focus-visible:ring-ring/30',
                  index === sound
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'bg-background hover:bg-muted',
                )}
              >
                <input
                  type="radio"
                  name="demo-sound"
                  value={name}
                  checked={index === sound}
                  onChange={() => setSound(index)}
                  className="sr-only"
                />
                {name}
              </label>
            ))}
          </fieldset>
        </div>
        <div className="h-48 border-t bg-muted/40 sm:h-56">
          {load && settings ? (
            <Suspense fallback={<Placeholder />}>
              <DemoPlayer settings={settings} />
            </Suspense>
          ) : (
            <Placeholder />
          )}
        </div>
        <div className="flex flex-col gap-3 border-t p-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>
            Tap or click the keys, or type: <kbd className="font-mono">Z S X D C</kbd>… is the
            bottom octave, <kbd className="font-mono">Q 2 W 3 E</kbd>… the one above.
          </p>
          {footer}
        </div>
      </div>
    </section>
  )
}

const cancelling =
  <Id,>(id: Id, cancel: (id: Id) => void) =>
  () =>
    cancel(id)

/** Stands in for the keyboard until it loads: a quiet row of white keys. */
const Placeholder = () => (
  <div className="flex h-full justify-center overflow-hidden" data-keyboard-placeholder>
    <p className="sr-only">Loading the keyboard…</p>
    {Array.from({ length: 15 }, (_, index) => (
      <div
        // biome-ignore lint/suspicious/noArrayIndexKey: a fixed row of identical shapes
        key={index}
        aria-hidden="true"
        className="h-full w-12 shrink-0 rounded-b-xl border border-t-0 border-r-0 border-key-black/20 bg-key-white last:border-r md:w-14 xl:w-16"
      />
    ))}
  </div>
)

export default PlaySection
