import { type Backend, backendFromEnv } from '@spotcraft/kit'

let instance: Backend | undefined

/**
 * Spotcraft's backend kit: guest accounts and the app's Postgres (`db`). Server code only (the
 * `.server.ts` name keeps it out of the browser bundle). Created on first use, not at import, so
 * building and prerendering the home page need no database. Reads DATABASE_URL, AUTH_SECRET and
 * PUBLIC_URL, and throws naming the one that is missing or wrong.
 */
export function backend(): Backend {
  instance ??= backendFromEnv()
  return instance
}
