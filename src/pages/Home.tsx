import { Link } from '@tanstack/react-router'
import { ArrowRight, AudioWaveform, KeyboardMusic, SlidersHorizontal } from 'lucide-react'
import type { ComponentType } from 'react'
import { buttonVariants } from '@/components/ui/button-variants'

// Every user-facing text below marked `COPY:` is a placeholder to be replaced with real copy.

interface Step {
  icon: ComponentType<{ className?: string }>
  title: string
  description: string
}

const STEPS: Step[] = [
  {
    icon: SlidersHorizontal,
    // COPY: step 1, shaping the sound with the three oscillators
    title: '[Step 1 title]',
    description: '[Step 1: one or two sentences about the oscillators: waveform, pitch, volume.]',
  },
  {
    icon: KeyboardMusic,
    // COPY: step 2, playing the keyboard
    title: '[Step 2 title]',
    description: '[Step 2: one or two sentences about playing: mouse, touch or keyboard.]',
  },
  {
    icon: AudioWaveform,
    // COPY: step 3, the master volume and the oscilloscope
    title: '[Step 3 title]',
    description: '[Step 3: one or two sentences about the master volume and the oscilloscope.]',
  },
]

const Home = () => (
  <>
    <section className="mx-auto flex w-full max-w-5xl flex-col items-center gap-6 px-4 pt-20 pb-12 text-center sm:pt-28">
      {/* COPY: eyebrow, a short label above the headline */}
      <p className="rounded-full border px-3 py-1 text-sm text-muted-foreground">[Eyebrow]</p>
      {/* COPY: headline */}
      <h1 className="max-w-3xl font-heading text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
        [Headline: what Vinskiano is, in one line]
      </h1>
      {/* COPY: subline */}
      <p className="max-w-2xl text-lg text-pretty text-muted-foreground">
        [Subline: one or two sentences on what you can do with it, in the browser, with no install.]
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
        <source srcSet="/screenshots/app-dark.jpg" media="(prefers-color-scheme: dark)" />
        <img
          src="/screenshots/app-light.jpg"
          alt="The Vinskiano synth: three oscillators with volume, waveform and pitch controls, a master volume knob and an oscilloscope above a one-octave keyboard, with the E key pressed"
          width={2560}
          height={1440}
          className="w-full rounded-2xl border shadow-xl"
        />
      </picture>
    </section>

    <section aria-labelledby="how-it-works" className="border-t bg-muted/40">
      <div className="mx-auto w-full max-w-5xl px-4 py-20">
        {/* COPY: section heading */}
        <h2
          id="how-it-works"
          className="text-center font-heading text-3xl font-semibold tracking-tight"
        >
          [How it works]
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
