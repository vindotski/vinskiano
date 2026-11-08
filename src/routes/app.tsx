import { createFileRoute, Link, Outlet } from '@tanstack/react-router'
import { LazyMotion, MotionConfig } from 'motion/react'
import { useRef } from 'react'
import { UNSAFE_PortalProvider as PortalProvider } from 'react-aria'
import AppBar from '../components/AppBar'
import Logo from '../components/icons/Logo'
import PresetsMenu from '../components/PresetsMenu'
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

/** The app bar, wired to the synth and the visitor's presets. */
function SynthBar() {
  const synth = useSynth()
  const presets = usePresets()
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
      oscillators={synth.oscillators}
      onOscillatorChange={synth.updateOscillator}
      master={synth.master}
      onMasterChange={synth.updateMaster}
      oscilloscope={synth.oscilloscope}
    />
  )
}
