import {
  createFileRoute,
  Link,
  Outlet,
  useNavigate,
  useParams,
  useSearch,
} from '@tanstack/react-router'
import { PianoIcon, SlidersHorizontalIcon } from 'lucide-react'
import { LazyMotion, MotionConfig } from 'motion/react'
import { useRef } from 'react'
import { UNSAFE_PortalProvider as PortalProvider } from 'react-aria'
import AppBar from '../components/AppBar'
import Logo from '../components/icons/Logo'
import PresetsMenu from '../components/PresetsMenu'
import { buttonVariants } from '../components/ui/button-variants'
import { type OscillatorId, toOscillatorId } from '../synth/oscillators'
import { SynthProvider, useSynth } from '../synth/SynthProvider'
import { usePresets } from '../synth/usePresets'

/** The synth: owns the audio engine, so it only exists under /app (the site never creates one). */
export const Route = createFileRoute('/app')({
  component: AppLayout,
})

const loadMotionFeatures = () => import('../lib/motion-features').then((module) => module.default)

function AppLayout() {
  const frame = useRef<HTMLDivElement>(null)
  return (
    // Motion is only used by the app, so the site never loads it. Animations use the small `m`
    // components; `strict` rejects the full `motion` ones. reducedMotion="user" skips
    // transforms and layout animations when the OS asks for less motion.
    <LazyMotion features={loadMotionFeatures} strict>
      <MotionConfig reducedMotion="user">
        <SynthProvider>
          {/* The app is a fixed, full-viewport instrument: nothing scrolls. */}
          <div className="fixed inset-0 overflow-hidden">
            {/* Fills the real viewport (dvh tracks mobile browser bars). Held upright, a phone gets the app rotated to landscape. */}
            <div
              ref={frame}
              data-app-frame
              className="flex h-dvh w-screen flex-col portrait:absolute portrait:top-[-100vw] portrait:left-0 portrait:h-[100vw] portrait:w-[100dvh] portrait:origin-bottom-left portrait:rotate-90 portrait:overflow-auto"
            >
              {/* Popovers (the waveform dropdown) render inside the frame, so they turn with it. */}
              <PortalProvider getContainer={() => frame.current}>
                <SynthBar />
                {/* The page area is what transitions between pages (view-transition-name: page). */}
                <main className="flex min-h-0 flex-1 flex-col [view-transition-name:page]">
                  <Outlet />
                </main>
              </PortalProvider>
            </div>
          </div>
        </SynthProvider>
      </MotionConfig>
    </LazyMotion>
  )
}

/** The app bar, wired to the synth, the visitor's presets and the URL (which oscillator it shows). */
function SynthBar() {
  const synth = useSynth()
  const presets = usePresets()
  const navigate = useNavigate()
  // On an oscillator's own page (/app/oscillators/2) the bar is about that one; on the keyboard,
  // `?osc=2` says which it shows.
  const detail = toOscillatorId(useParams({ strict: false }).id)
  const search = toOscillatorId(useSearch({ strict: false }).osc)
  const shown = detail ?? search ?? 1
  // Switching only changes the bar (or which oscillator the page shows): no crossfade, and no
  // history entry per switch.
  const show = (osc: OscillatorId) =>
    detail
      ? navigate({
          to: '/app/oscillators/$id',
          params: { id: String(osc) },
          replace: true,
          viewTransition: false,
        })
      : navigate({
          to: '/app',
          search: osc === 1 ? {} : { osc },
          replace: true,
          resetScroll: false,
          viewTransition: false,
        })
  const linkStyle = buttonVariants({
    variant: 'ghost',
    size: 'icon-sm',
    className: 'size-7 md:size-8',
  })
  return (
    <AppBar
      start={
        <Link
          to="/"
          aria-label="Vinskiano home"
          className="rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
        >
          <Logo className="size-7" />
        </Link>
      }
      end={
        <PresetsMenu
          presets={presets.presets}
          pending={presets.pending}
          message={presets.message}
          onOpen={presets.load}
          onSave={(name) =>
            presets.save(name, { master: synth.master, oscillators: synth.oscillators })
          }
          onLoad={(preset) => {
            synth.loadSettings(preset.settings)
            presets.announce(`Loaded “${preset.name}”`)
          }}
          onDelete={presets.remove}
        />
      }
      shownOscillator={shown}
      onShowOscillator={show}
      // Its own page shows the oscillator in detail, so the bar leaves its strip out.
      oscillator={detail ? undefined : synth.oscillators.find((o) => o.id === shown)}
      onOscillatorChange={synth.updateOscillator}
      nav={
        detail ? (
          <Link
            to="/app"
            search={shown === 1 ? {} : { osc: shown }}
            aria-label="Back to the keyboard"
            className={linkStyle}
          >
            <PianoIcon className="size-5 text-primary" />
          </Link>
        ) : (
          <Link
            to="/app/oscillators/$id"
            params={{ id: String(shown) }}
            aria-label={`Oscillator ${shown} in detail`}
            className={linkStyle}
          >
            <SlidersHorizontalIcon className="size-5 text-primary" />
          </Link>
        )
      }
      master={synth.master}
      onMasterChange={synth.updateMaster}
      oscilloscope={synth.oscilloscope}
    />
  )
}
