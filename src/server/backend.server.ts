import { type Backend, backendFromEnv } from '@spotcraft/kit'
import { type PrepareOptions, prepare } from '@spotcraft/kit/tanstack-start'
import type { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { MIGRATIONS } from './migrations'

/**
 * One backend per server process. This module is bundled twice, into the app (by Vite) and into
 * the startup plugin (by Nitro), so the instance lives on `globalThis`: both copies use the same
 * pool, and the one the plugin prepared and closes is the one requests use.
 */
const KEY: unique symbol = Symbol.for('vinskiano.backend')
const global = globalThis as typeof globalThis & { [KEY]?: Backend }

/**
 * Spotcraft's backend kit: guest accounts and the app's Postgres (`db`). Server code only (the
 * `.server.ts` name keeps it out of the browser bundle). Created on first use, not at import, so
 * building and prerendering the home page need no database. Reads DATABASE_URL, AUTH_SECRET and
 * PUBLIC_URL, and throws naming the one that is missing or wrong.
 */
export function backend(): Backend {
  global[KEY] ??= backendFromEnv()
  return global[KEY]
}

/** What the kit does before the first query: check the database, then apply the migrations. */
export const PREPARE: PrepareOptions = { migrations: MIGRATIONS }

/**
 * The app's database, with its migrations applied. The kit runs that once per backend (at start
 * in production, `startup.ts`; on first use in dev), and again after a failure.
 */
export async function database(): Promise<NodePgDatabase> {
  await prepare(backend(), PREPARE)
  return backend().db
}
