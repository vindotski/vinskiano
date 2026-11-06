import { createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'

/** Start calls this once per request on the server, and once in the browser. */
export function getRouter() {
  return createRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0,
    // Page changes use the browser's View Transitions API; see the view-transition styles in
    // styles.css. Browsers without it simply switch pages instantly.
    defaultViewTransition: true,
  })
}

// Gives Link, useNavigate and friends type-safe paths.
declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
