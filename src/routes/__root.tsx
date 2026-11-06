import { TanStackDevtools } from '@tanstack/react-devtools'
import { createRootRoute, HeadContent, Outlet, Scripts } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { LazyMotion, MotionConfig } from 'motion/react'
import type { ReactNode } from 'react'
import Navbar from '../components/Navbar'
import NotFound from '../pages/NotFound'
import appCss from '../styles.css?url'
import { SynthProvider } from '../synth/SynthProvider'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      {
        name: 'viewport',
        content:
          'width=device-width, initial-scale=1, user-scalable=0, maximum-scale=1, minimum-scale=1',
      },
      { title: 'Vinskiano' },
      { name: 'description', content: 'Browser-based subtractive synthesizer' },
      { name: 'color-scheme', content: 'light dark' },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
      { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
      { rel: 'manifest', href: '/manifest.json' },
    ],
  }),
  shellComponent: RootDocument,
  component: RootLayout,
  notFoundComponent: NotFound,
})

/** The HTML document, rendered on the server for every page. */
function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
        {/* Two theme-color tags (light and dark) share a name, and HeadContent keeps only
            one meta per name, so these are written here directly. */}
        <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#1d161e" media="(prefers-color-scheme: dark)" />
      </head>
      <body>
        <noscript>Vinskiano needs JavaScript to make sound.</noscript>
        {children}
        {/* Development only: the devtools Vite plugin removes this from production builds. */}
        <TanStackDevtools
          config={{ position: 'bottom-right' }}
          plugins={[{ name: 'TanStack Router', render: <TanStackRouterDevtoolsPanel /> }]}
        />
        <Scripts />
      </body>
    </html>
  )
}

const loadMotionFeatures = () => import('../lib/motion-features').then((module) => module.default)

/** The app frame around every page: synth state, navbar, then the page. */
function RootLayout() {
  return (
    // Animations use the small `m` components; `strict` rejects the full `motion` ones.
    // reducedMotion="user" skips transforms and layout animations when the OS asks for less motion.
    <LazyMotion features={loadMotionFeatures} strict>
      <MotionConfig reducedMotion="user">
        <SynthProvider>
          {/* Fills the real viewport (dvh tracks mobile browser bars). Held upright, a phone gets the app rotated to landscape. */}
          <div className="flex h-dvh w-screen flex-col portrait:absolute portrait:top-[-100vw] portrait:left-0 portrait:h-[100vw] portrait:w-[100dvh] portrait:origin-bottom-left portrait:rotate-90 portrait:overflow-auto">
            <Navbar />
            <Outlet />
          </div>
        </SynthProvider>
      </MotionConfig>
    </LazyMotion>
  )
}
