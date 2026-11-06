import { createFileRoute, Outlet } from '@tanstack/react-router'
import { LazyMotion, MotionConfig } from 'motion/react'
import Navbar from '../components/Navbar'
import { SynthProvider } from '../synth/SynthProvider'

/** The synth: owns the audio engine, so it only exists under /app (the site never creates one). */
export const Route = createFileRoute('/app')({
  component: AppLayout,
})

const loadMotionFeatures = () => import('../lib/motion-features').then((module) => module.default)

function AppLayout() {
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
            <div className="flex h-dvh w-screen flex-col portrait:absolute portrait:top-[-100vw] portrait:left-0 portrait:h-[100vw] portrait:w-[100dvh] portrait:origin-bottom-left portrait:rotate-90 portrait:overflow-auto">
              <Navbar />
              {/* The page area is what transitions between pages (view-transition-name: page). */}
              <main className="flex min-h-0 flex-1 flex-col [view-transition-name:page]">
                <Outlet />
              </main>
            </div>
          </div>
        </SynthProvider>
      </MotionConfig>
    </LazyMotion>
  )
}
