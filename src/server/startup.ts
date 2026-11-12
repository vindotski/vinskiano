import { definePlugin } from 'nitro'
import { closeBackend, database } from './backend.server'

/**
 * When the production server starts: checks the backend kit's settings (DATABASE_URL,
 * AUTH_SECRET, PUBLIC_URL), connects to the database and applies the app's migrations. If any of
 * that fails, the server exits naming the problem, so the deploy's health check fails and the
 * previous version keeps running. (Otherwise the server would start, pass its health check, since
 * the home page needs no database, and only fail on the first save.) Nitro holds requests until
 * this is done. On shutdown, it closes the database connections.
 *
 * Skipped while prerendering at build time (no settings there) and in dev, so `pnpm dev` works
 * without a database (the first save migrates instead).
 */
export default definePlugin(async (nitroApp) => {
  if (import.meta.prerender || import.meta.dev) return
  nitroApp.hooks.hook('close', closeBackend)
  try {
    await database()
  } catch (error) {
    console.error('The server cannot start:', error)
    process.exit(1)
  }
})
