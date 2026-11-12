import { EventEmitter } from 'node:events'
import { type Backend, backendFromEnv } from '@spotcraft/kit'
import type { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { migrate } from './migrate.server'

/**
 * One backend per server process. This module is bundled twice, into the app (by Vite) and into
 * the startup plugin (by Nitro), so the instance lives on `globalThis`: both copies use the same
 * pool, and the one the plugin migrated and closes is the one requests use.
 */
interface Shared {
  backend?: Backend | undefined
  migrated?: Promise<void> | undefined
}
const KEY: unique symbol = Symbol.for('vinskiano.backend')
const global = globalThis as typeof globalThis & { [KEY]?: Shared }
global[KEY] ??= {}
const shared: Shared = global[KEY]

/**
 * Spotcraft's backend kit: guest accounts and the app's Postgres (`db`). Server code only (the
 * `.server.ts` name keeps it out of the browser bundle). Created on first use, not at import, so
 * building and prerendering the home page need no database. Reads DATABASE_URL, AUTH_SECRET and
 * PUBLIC_URL, and throws naming the one that is missing or wrong.
 */
export function backend(): Backend {
  if (!shared.backend) {
    const created = backendFromEnv()
    // A pooled connection that breaks while idle (Postgres restarted, a network blip) is
    // reported on the pool; with no listener that would crash the server. The pool drops the
    // connection and opens a new one when it's next needed.
    const pool: unknown = Reflect.get(created.db, '$client')
    if (pool instanceof EventEmitter) {
      pool.on('error', (error: Error) => console.error('Postgres connection lost:', error.message))
    }
    shared.backend = created
  }
  return shared.backend
}

/** The app's database, with its migrations applied (once per server; retried after a failure). */
export async function database(): Promise<NodePgDatabase> {
  const { db } = backend()
  shared.migrated ??= migrate(db).catch((error: unknown) => {
    shared.migrated = undefined
    throw error
  })
  await shared.migrated
  return db
}

/** Closes the database connections, if there are any (when the server shuts down). */
export async function closeBackend() {
  const { backend } = shared
  shared.backend = undefined
  shared.migrated = undefined
  await backend?.close()
}
