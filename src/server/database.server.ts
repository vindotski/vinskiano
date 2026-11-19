import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres'
import pg from 'pg'

/**
 * One connection pool per server process. This module is bundled twice, into the app (by Vite)
 * and into the startup plugin (by Nitro), so it lives on `globalThis`: both copies use the same
 * pool, and the one the plugin closes is the one requests use.
 */
const KEY: unique symbol = Symbol.for('vinskiano.database')
const global = globalThis as typeof globalThis & {
  [KEY]?: { pool: pg.Pool; db: NodePgDatabase }
}

/**
 * The app's schema on Spotcraft (`app_vinskiano`), through Drizzle. Server code only (the
 * `.server.ts` name keeps it out of the browser bundle). Created on first use, not at import, so
 * building and prerendering the home page need no database. The role's search path is its
 * schema, so unqualified names land there. Spotcraft runs the migrations before a new version
 * starts (`startup.ts`); `spotcraft dev` runs them locally.
 */
export function database(): NodePgDatabase {
  if (!global[KEY]) {
    const url = process.env.DATABASE_URL
    if (!url) throw new Error('DATABASE_URL is not set')
    const pool = new pg.Pool({ connectionString: url, max: 10 })
    // A pooled connection that breaks while idle is reported here; with no listener it would
    // crash the server. The pool opens a new one when needed.
    pool.on('error', (error) => console.error('Postgres connection lost:', error.message))
    global[KEY] = { pool, db: drizzle(pool) }
  }
  return global[KEY].db
}

/** Closes the connections, if any were opened (on shutdown). */
export async function closeDatabase(): Promise<void> {
  const open = global[KEY]
  delete global[KEY]
  await open?.pool.end()
}
