import { sql } from 'drizzle-orm'
import type { NodePgDatabase } from 'drizzle-orm/node-postgres'

/**
 * The app's migrations: numbered SQL files (`0001_presets.sql`, …) for the tables in `public`.
 * Vite inlines them at build time, so the server reads no files. They only ever add.
 */
const files = import.meta.glob<string>('./migrations/*.sql', {
  query: '?raw',
  import: 'default',
  eager: true,
})

export const migrations = Object.entries(files)
  .map(([path, text]) => {
    const match = /\/(\d{4})_([a-z0-9_]+)\.sql$/.exec(path)
    if (!match?.[1] || !match[2]) throw new Error(`Migration file not named NNNN_name.sql: ${path}`)
    return { version: Number(match[1]), name: match[2], sql: text }
  })
  .sort((a, b) => a.version - b.version)

/** Any fixed number: the advisory lock that makes concurrent runs (several servers) wait. */
const MIGRATION_LOCK = 4_826_101

/** Applies the migrations this database hasn't had yet, all in one transaction. */
export async function migrate(db: NodePgDatabase) {
  await db.transaction(async (tx) => {
    await tx.execute(sql`SELECT pg_advisory_xact_lock(${MIGRATION_LOCK})`)
    await tx.execute(sql`CREATE TABLE IF NOT EXISTS app_migrations (
      version    integer PRIMARY KEY,
      name       text NOT NULL,
      applied_at timestamptz NOT NULL DEFAULT now()
    )`)
    const { rows } = await tx.execute<{ version: number }>(
      sql`SELECT coalesce(max(version), 0)::int AS version FROM app_migrations`,
    )
    const applied = rows[0]?.version ?? 0
    for (const migration of migrations.filter((m) => m.version > applied)) {
      await tx.execute(sql.raw(migration.sql))
      await tx.execute(
        sql`INSERT INTO app_migrations (version, name) VALUES (${migration.version}, ${migration.name})`,
      )
    }
  })
}
