import { Link } from '@tanstack/react-router'
import { ArrowRight, AudioWaveform, KeyboardMusic, SlidersHorizontal } from 'lucide-react'
import type { ComponentType } from 'react'
import dark640 from '@/assets/screenshots/app-dark-640.webp'
import dark1280 from '@/assets/screenshots/app-dark-1280.webp'
import dark2560 from '@/assets/screenshots/app-dark-2560.webp'
import light640 from '@/assets/screenshots/app-light-640.webp'
import light1280 from '@/assets/screenshots/app-light-1280.webp'
import light2560 from '@/assets/screenshots/app-light-2560.webp'
import { buttonVariants } from '@/components/ui/button-variants'

// Screenshots of the app (`pnpm screenshots`), imported so the build gives them hashed names
// that can be cached for good. Each in three widths; the browser picks by screen size.
const LIGHT = `${light640} 640w, ${light1280} 1280w, ${light2560} 2560w`
const DARK = `${dark640} 640w, ${dark1280} 1280w, ${dark2560} 2560w`
// The image spans the content column: max-w-5xl (64rem) minus px-4 on each side.
const SIZES = '(min-width: 64rem) 62rem, calc(100vw - 2rem)'

interface Step {
  icon: ComponentType<{ className?: string }>
  title: string
  description: string
}

const STEPS: Step[] = [
  {
    icon: SlidersHorizontal,
    title: 'Shape the sound',
    description:
      'Each of the three oscillators has its own waveform (sine, square, triangle or sawtooth), pitch (up to two octaves up or down) and volume. Layer them to build your tone.',
  },
  {
    icon: KeyboardMusic,
    title: 'Play the keyboard',
    description:
      'Thirteen keys, from C4 to the C above. Click, tap, or use your keyboard: Tab to a key and hold Space.',
  },
  {
    icon: AudioWaveform,
    title: 'Watch what you hear',
    description:
      'Set the overall level with the master knob, and see the combined waveform live on the oscilloscope.',
  },
]

const Home = () => (
  <>
    <section className="mx-auto flex w-full max-w-5xl flex-col items-center gap-6 px-4 pt-20 pb-12 text-center sm:pt-28">
      <p className="rounded-full border px-3 py-1 text-sm text-muted-foreground">
        Free and open source · Runs in your browser
      </p>
      <h1 className="max-w-3xl font-heading text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
        A three-oscillator synth that lives in your browser
      </h1>
      <p className="max-w-2xl text-lg text-pretty text-muted-foreground">
        Stack three oscillators, pick their waveforms, tune them up to two octaves apart, and play.
        No install, no account, no plug-ins: open it and press a key.
      </p>
      <div className="flex flex-col items-center gap-3 sm:flex-row">
        <Link to="/app" className={buttonVariants({ size: 'lg' })}>
          Open the synth
          <ArrowRight data-icon="inline-end" />
        </Link>
        <a
          href="https://github.com/vindotski/vinskiano"
          className={buttonVariants({ size: 'lg', variant: 'outline' })}
        >
          Source on GitHub
        </a>
      </div>
    </section>

    <section aria-label="Screenshot" className="mx-auto w-full max-w-5xl px-4 pb-20">
      <picture>
        <source srcSet={DARK} sizes={SIZES} media="(prefers-color-scheme: dark)" />
        <img
          src={light1280}
          srcSet={LIGHT}
          sizes={SIZES}
          // The largest thing on the page: fetch it first.
          fetchPriority="high"
          alt="The Vinskiano synth: a bar with an oscillator select, that oscillator's volume, waveform and pitch controls, a master volume knob and an oscilloscope, above a one-octave keyboard with the E key pressed"
          width={2560}
          height={1440}
          className="w-full rounded-2xl border shadow-xl"
        />
      </picture>
    </section>

    <section aria-labelledby="how-it-works" className="border-t bg-muted/40">
      <div className="mx-auto w-full max-w-5xl px-4 py-20">
        <h2
          id="how-it-works"
          className="text-center font-heading text-3xl font-semibold tracking-tight"
        >
          How it works
        </h2>
        <ol className="mt-12 grid gap-6 sm:grid-cols-3">
          {STEPS.map(({ icon: Icon, title, description }, index) => (
            <li key={title} className="flex flex-col gap-3 rounded-2xl border bg-card p-6">
              <div className="flex items-center gap-3">
                <span className="grid size-8 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                  {index + 1}
                </span>
                <Icon className="size-5 text-muted-foreground" aria-hidden="true" />
              </div>
              <h3 className="font-heading text-lg font-semibold">{title}</h3>
              <p className="text-sm text-muted-foreground">{description}</p>
            </li>
          ))}
        </ol>
        <div className="mt-12 flex justify-center">
          <Link to="/app" className={buttonVariants({ variant: 'outline' })}>
            Open the synth
            <ArrowRight data-icon="inline-end" />
          </Link>
        </div>
      </div>
    </section>
  </>
)

export default Home
