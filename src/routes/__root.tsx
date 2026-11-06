import { createRootRoute, HeadContent, Outlet, Scripts } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import Navbar from '../components/Navbar'
import appCss from '../index.css?url'
import NotFound from '../pages/NotFound'
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
        <Scripts />
      </body>
    </html>
  )
}

/** The app frame around every page: synth state, navbar, then the page. */
function RootLayout() {
  return (
    <SynthProvider>
      {/* Fills the real viewport. Held upright, a phone gets the app rotated to landscape. */}
      <div className="flex h-[calc(var(--vh)*100)] w-screen flex-col portrait:absolute portrait:top-[-100vw] portrait:left-0 portrait:h-[100vw] portrait:w-[calc(var(--vh)*100)] portrait:origin-bottom-left portrait:rotate-90 portrait:overflow-auto">
        <Navbar />
        <Outlet />
      </div>
    </SynthProvider>
  )
}
