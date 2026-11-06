import { createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'

export const router = createRouter({ routeTree, defaultPreload: 'intent' })

// Gives Link, useNavigate and friends type-safe paths.
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
