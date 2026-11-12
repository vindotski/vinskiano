import { sql } from 'drizzle-orm'
import type { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { MIGRATIONS } from './migrations'

export interface Migration {
  version: number
  name: string
  sql: string
}

/** The migrations, checked: numbered from 1 up without repeats, named in snake_case. */
export const migrations: readonly Migration[] = MIGRATIONS.map((migration, index, all) => {
  const previous = all[index - 1]?.version ?? 0
  if (!Number.isInteger(migration.version) || migration.version <= previous) {
    throw new Error(`Migrations must be numbered in order: ${migration.version} after ${previous}`)
  }
  if (!/^[a-z0-9_]+$/.test(migration.name)) {
    throw new Error(`Migration name not in snake_case: ${migration.name}`)
  }
  return migration
})

/**
 * The migrations a database still needs, given the versions it has. A migration numbered below
 * the newest one it has, but missing, was added out of order (say, on a branch that merged
 * late): running it after newer ones could do the wrong thing, so that stops here instead.
 */
export function pending(all: readonly Migration[], applied: readonly number[]): Migration[] {
  const newest = Math.max(0, ...applied)
  const skipped = all.filter((m) => m.version < newest && !applied.includes(m.version))
  if (skipped.length > 0) {
    const names = skipped.map((m) => `${m.version} (${m.name})`).join(', ')
    throw new Error(
      `Migration ${names} is numbered below ${newest}, which the database already has: renumber it after ${newest}`,
    )
  }
  return all.filter((m) => m.version > newest)
}

/** Any fixed number: the advisory lock that makes concurrent runs (several servers) wait. */
const MIGRATION_LOCK = 4_826_101

/** Applies the migrations this database hasn't had yet, all in one transaction. */
export async function migrate(db: NodePgDatabase) {
  await db.transaction(async (tx) => {
    await tx.execute(sql`SELECT pg_advisory_xact_lock(${MIGRATION_LOCK})`)
    // A migration that needs a table lock waits for it at most this long, then fails (and the
    // deploy with it), rather than queueing every request behind it while it waits.
    await tx.execute(sql`SET LOCAL lock_timeout = '5s'`)
    await tx.execute(sql`CREATE TABLE IF NOT EXISTS app_migrations (
      version    integer PRIMARY KEY,
      name       text NOT NULL,
      applied_at timestamptz NOT NULL DEFAULT now()
    )`)
    const { rows } = await tx.execute<{ version: number }>(sql`SELECT version FROM app_migrations`)
    for (const migration of pending(
      migrations,
      rows.map((row) => row.version),
    )) {
      await tx.execute(sql.raw(migration.sql))
      await tx.execute(
        sql`INSERT INTO app_migrations (version, name) VALUES (${migration.version}, ${migration.name})`,
      )
    }
  })
}
