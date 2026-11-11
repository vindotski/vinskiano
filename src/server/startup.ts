import { backendFromEnv } from '@spotcraft/kit'
import { definePlugin } from 'nitro'

/**
 * Checks the backend kit's settings (DATABASE_URL, AUTH_SECRET, PUBLIC_URL) when the production
 * server starts, so a deploy with a missing or wrong one stops right away, naming it, and
 * Spotcraft keeps the previous version running. Otherwise the server would start, pass its health
 * check (the home page needs no database), and only fail on the first save. Nothing connects to
 * the database here. Skipped while prerendering at build time (no settings there) and in dev.
 *
 * Nitro bundles this file itself, outside Vite (no `import.meta.glob`), so it uses the kit
 * directly rather than `backend()`, and closes what it made.
 */
export default definePlugin(() => {
  if (import.meta.prerender || import.meta.dev) return
  void backendFromEnv().close()
})
