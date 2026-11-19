import { Link } from '@tanstack/react-router'
import { ArrowRight, AudioWaveform, KeyboardMusic, ListMusic, Save, Send } from 'lucide-react'
import type { ComponentType } from 'react'
import dark640 from '@/assets/screenshots/app-dark-640.webp'
import dark1280 from '@/assets/screenshots/app-dark-1280.webp'
import dark2560 from '@/assets/screenshots/app-dark-2560.webp'
import light640 from '@/assets/screenshots/app-light-640.webp'
import light1280 from '@/assets/screenshots/app-light-1280.webp'
import light2560 from '@/assets/screenshots/app-light-2560.webp'
import PlaySection from '@/components/home/PlaySection'
import { buttonVariants } from '@/components/ui/button-variants'

// Screenshots of the app (`pnpm screenshots`), imported so the build gives them hashed names
// that can be cached for good. Each in three widths; the browser picks by screen size.
const LIGHT = `${light640} 640w, ${light1280} 1280w, ${light2560} 2560w`
const DARK = `${dark640} 640w, ${dark1280} 1280w, ${dark2560} 2560w`
// The image spans the content column: max-w-5xl (64rem) minus px-4 on each side.
const SIZES = '(min-width: 64rem) 62rem, calc(100vw - 2rem)'

const REPO = 'https://github.com/vindotski/vinskiano'
// HEAD is the repository's default branch, so these links follow it.
const PARITY = `${REPO}/blob/HEAD/docs/parity.md`
const ROADMAP = `${REPO}/blob/HEAD/docs/roadmap.md`

/**
 * The product loop (docs/product.md): what a visitor does, step by step. `coming` names what a
 * step still lacks; a step with `soon` isn't built at all yet.
 */
interface Step {
  icon: ComponentType<{ className?: string }>
  title: string
  description: string
  coming?: string
  soon?: true
}

const STEPS: Step[] = [
  {
    icon: ListMusic,
    title: 'Pick a sound',
    description:
      'Try four ready-made sounds right here on this page, or open the synth on a new one: three sine waves an octave apart.',
    coming: 'more sounds to start from, in the synth itself',
  },
  {
    icon: KeyboardMusic,
    title: 'Play it',
    description:
      'All 88 keys, with as many fingers as you like, the mouse, or your computer keyboard in FL Studio’s layout. On a phone too, held either way.',
    coming: 'MIDI keyboards',
  },
  {
    icon: AudioWaveform,
    title: 'Make it yours',
    description:
      'Three oscillators, each with a waveform and a pitch up to two octaves up or down, mixed like 3x Osc: the levels always add up to 100%.',
    coming: 'envelopes and a filter',
  },
  {
    icon: Save,
    title: 'Keep it',
    description:
      'Save it as a preset and load it later. Your first save makes you a guest, kept by a cookie: no email, no password.',
    coming: 'your sound kept when you reload, even unsaved',
  },
  {
    icon: Send,
    title: 'Send it to a friend',
    description:
      'One tap makes a link. Your friend hears your sound, makes it theirs, and sends it back.',
    soon: true,
  },
]

const FL_POINTS = [
  'Oscillators 2 and 3 take their share of the mix the way 3x Osc’s Mix knobs do, so the levels always add up to 100%.',
  'Coarse pitch goes two octaves up or down, like 3x Osc’s.',
  'The computer keyboard plays in FL Studio’s layout: Z S X D C… and Q 2 W 3 E….',
]

// In the order of docs/roadmap.md's milestones.
const COMING = [
  'Sounds to start from, in the synth itself',
  'Links that send a sound to a friend',
  'Your sound kept when you reload',
  'Envelopes for volume and pitch',
  'A filter with cutoff and resonance envelopes',
  'Fine tuning, stereo detune, phase and pan per oscillator',
  'LFOs',
  'Mono, portamento, velocity and MIDI keyboards',
  'An arpeggiator',
]

interface Question {
  question: string
  answer: string
}

const FAQ: Question[] = [
  {
    question: 'Is it free?',
    answer:
      'Yes. Vinskiano is free to use and open source under the Apache 2.0 license; the code is on GitHub.',
  },
  {
    question: 'Do I need an account?',
    answer:
      'No. Playing needs nothing at all. Saving a preset makes you a guest account behind the scenes, with no email or password.',
  },
  {
    question: 'Where are my presets kept?',
    answer:
      'On our server, under your guest account, which a cookie in your browser remembers for a year. Clearing your cookies or switching browsers starts a new, empty list.',
  },
  {
    question: 'Do you track me?',
    answer:
      'No. The server counts visits and how far people get (a note played, a sound changed, a preset saved), with no cookies and nothing that tells one visitor from another. Privacy, at the bottom of every page, lists what’s counted and lets you turn it off.',
  },
  {
    question: 'Does it work on my phone?',
    answer:
      'Yes, held either way. Play with several fingers at once. On an iPhone it plays even with the silent switch on.',
  },
  {
    question: 'Can I use a MIDI keyboard?',
    answer:
      'Not yet. MIDI is planned; until then, play with the mouse, by touch or with your computer keyboard.',
  },
  {
    question: 'Can I use it with a screen reader or without a mouse?',
    answer:
      'Yes. Every control has a name for screen readers and works by keyboard: knobs take the arrows, Page Up and Down, Home and End. Animations respect reduced motion, and dark mode follows your system.',
  },
  {
    question: 'Which browsers does it run in?',
    answer:
      'Chrome or Edge 111 and later, Safari 16.4 and later (Mac and iPhone), Firefox 128 and later.',
  },
]

const SECTION_HEADING =
  'scroll-mt-20 font-heading text-3xl font-semibold tracking-tight text-balance'

const OpenSynth = ({ variant }: { variant?: 'default' | 'outline' }) => (
  <Link to="/app" className={buttonVariants({ variant })}>
    Open the synth
    <ArrowRight data-icon="inline-end" />
  </Link>
)

const Home = () => (
  <>
    <section className="mx-auto flex w-full max-w-5xl flex-col items-center gap-6 px-4 pt-20 pb-12 text-center sm:pt-28">
      <p className="rounded-full border px-3 py-1 text-sm text-muted-foreground">
        Free and open source · Runs in your browser
      </p>
      <h1 className="max-w-3xl font-heading text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
        {/* With share links (docs/roadmap.md, milestone 1) this becomes the whole loop:
            "Pick a sound, make it yours, send it to a friend". */}
        Pick a sound and make it yours
      </h1>
      <p className="max-w-2xl text-lg text-pretty text-muted-foreground">
        A three-oscillator synth in your browser, mixed like FL Studio’s 3x Osc. Start from a sound,
        play it on any keys you have, and shape it until it’s yours. Soon, send it to a friend as a
        link. No install, no account: press a key.
      </p>
      <div className="flex flex-col items-center gap-3 sm:flex-row">
        <a href="#play" className={buttonVariants()}>
          Play it here
        </a>
        <OpenSynth variant="outline" />
      </div>
    </section>

    <PlaySection
      footer={
        <Link
          to="/app"
          className={buttonVariants({ variant: 'ghost', className: 'self-start sm:self-auto' })}
        >
          Open the synth
          <ArrowRight data-icon="inline-end" />
        </Link>
      }
    />

    <section aria-labelledby="full-synth" className="mx-auto w-full max-w-5xl px-4 pb-20">
      <h2 id="full-synth" className={`${SECTION_HEADING} text-center`}>
        The full synth
      </h2>
      <p className="mx-auto mt-3 max-w-2xl text-center text-pretty text-muted-foreground">
        Every oscillator, the master volume, an oscilloscope of what you hear, and your presets, on
        one screen above the keyboard.
      </p>
      <picture>
        <source srcSet={DARK} sizes={SIZES} media="(prefers-color-scheme: dark)" />
        <img
          src={light1280}
          srcSet={LIGHT}
          sizes={SIZES}
          loading="lazy"
          decoding="async"
          alt="The Vinskiano synth: a bar with a master volume knob, an oscilloscope, the presets menu and a button to the oscillators, above a scrolling 88-key keyboard and its minimap with the E key pressed"
          width={2560}
          height={1440}
          className="mt-10 w-full rounded-2xl border shadow-xl"
        />
      </picture>
    </section>

    <section aria-labelledby="how-it-works" className="border-t bg-muted/40">
      <div className="mx-auto w-full max-w-5xl px-4 py-20">
        <h2 id="how-it-works" className={`${SECTION_HEADING} text-center`}>
          How it works
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-pretty text-muted-foreground">
          Five steps, and the last one starts the first again, for someone else.
        </p>
        <ol className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {STEPS.map(({ icon: Icon, title, description, coming, soon }, index) => (
            <li key={title} className="flex flex-col gap-3 rounded-2xl border bg-card p-6">
              <div className="flex items-center justify-between gap-3">
                <Icon className="size-6 text-primary" aria-hidden="true" />
                {soon && (
                  <span className="rounded-full border px-2.5 py-0.5 text-xs text-muted-foreground">
                    Coming next
                  </span>
                )}
              </div>
              <h3 className="font-heading text-lg font-semibold">
                <span className="text-muted-foreground">{index + 1}. </span>
                {title}
              </h3>
              <p className="text-sm text-muted-foreground">{description}</p>
              {coming && (
                <p className="mt-auto text-sm">
                  <span className="font-medium">Coming:</span> {coming}
                </p>
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>

    <section aria-labelledby="fl-studio" className="border-t">
      <div className="mx-auto grid w-full max-w-5xl gap-10 px-4 py-20 md:grid-cols-2">
        <div className="flex flex-col gap-4">
          <h2 id="fl-studio" className={SECTION_HEADING}>
            For FL Studio users
          </h2>
          <p className="text-pretty text-muted-foreground">
            Vinskiano is inspired by FL Studio’s 3x Osc. The goal is that a 3x Osc recipe (“saw, osc
            2 a fifth up at 50%…”) sounds the same here. It isn’t made by or connected to
            Image-Line.
          </p>
          <a
            href={PARITY}
            className={buttonVariants({ variant: 'outline', className: 'self-start' })}
          >
            What matches 3x Osc so far
          </a>
        </div>
        <ul className="flex flex-col gap-3">
          {FL_POINTS.map((point) => (
            <li key={point} className="rounded-2xl border bg-card p-4 text-sm">
              {point}
            </li>
          ))}
        </ul>
      </div>
    </section>

    <section aria-labelledby="coming-next" className="border-t bg-muted/40">
      <div className="mx-auto w-full max-w-5xl px-4 py-20">
        <h2 id="coming-next" className={`${SECTION_HEADING} text-center`}>
          Coming next
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-pretty text-muted-foreground">
          First what closes the loop, then what makes sounds differ, then the rest of 3x Osc.
          Planned, in about this order:
        </p>
        <ol className="mx-auto mt-10 flex max-w-2xl flex-col gap-2">
          {COMING.map((item, index) => (
            <li key={item} className="flex items-center gap-3 rounded-xl border bg-card p-4">
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                {index + 1}
              </span>
              {item}
            </li>
          ))}
        </ol>
        <div className="mt-8 flex justify-center">
          <a href={ROADMAP} className={buttonVariants({ variant: 'outline' })}>
            Read the roadmap
          </a>
        </div>
      </div>
    </section>

    <section aria-labelledby="faq" className="border-t">
      <div className="mx-auto w-full max-w-3xl px-4 py-20">
        <h2 id="faq" className={`${SECTION_HEADING} text-center`}>
          Questions
        </h2>
        <div className="mt-10 divide-y rounded-2xl border bg-card">
          {FAQ.map(({ question, answer }) => (
            <details key={question} className="group px-4">
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 rounded-lg font-medium outline-none focus-visible:ring-3 focus-visible:ring-ring/30 [&::-webkit-details-marker]:hidden">
                {question}
                <span
                  aria-hidden="true"
                  className="text-xl text-muted-foreground transition-transform group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="pb-4 text-sm text-muted-foreground">{answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>

    <section aria-labelledby="start" className="border-t bg-muted/40">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-6 px-4 py-20 text-center">
        <h2 id="start" className={SECTION_HEADING}>
          Ready to make a sound?
        </h2>
        <div className="flex flex-col items-center gap-3 sm:flex-row">
          <OpenSynth />
          <a href={REPO} className={buttonVariants({ variant: 'outline' })}>
            Source on GitHub
          </a>
        </div>
      </div>
    </section>
  </>
)

export default Home
