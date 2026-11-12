import { TanStackDevtools } from '@tanstack/react-devtools'
import { createRootRoute, HeadContent, Scripts } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import type { ReactNode } from 'react'
import NotFound from '../pages/NotFound'
import appCss from '../styles.css?url'

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
      {
        name: 'description',
        content:
          'A free synth that plays in your browser: three oscillators mixed like FL Studio’s 3x Osc, 88 keys, and your computer keyboard as a piano.',
      },
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
