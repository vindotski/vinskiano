import pg from 'pg'
import type { Migration } from './migrations'

// Any constant works; it only has to be the same for every run migrating Vinskiano.
const LOCK = 8_301_449_027

/** The migrations must be numbered from 1, in order, with snake_case names. */
export function checkMigrations(migrations: readonly Migration[]): void {
  migrations.forEach((migration, index) => {
    if (migration.version !== index + 1) {
      throw new Error(`Migration ${migration.name} should be version ${index + 1}`)
    }
    if (!/^[a-z0-9]+(_[a-z0-9]+)*$/.test(migration.name)) {
      throw new Error(`Migration name ${migration.name} isn't snake_case`)
    }
  })
}

/**
 * Applies the migrations the database at `url` hasn't had yet, in one transaction under an
 * advisory lock, and records them in `app_migrations` in the app's schema (the role's search
 * path). Returns how many it applied. Spotcraft runs this before a new version starts
 * (`startup.ts`), and `spotcraft dev` locally (`pnpm db:migrate`).
 */
export async function migrate(url: string, migrations: readonly Migration[]): Promise<number> {
  checkMigrations(migrations)
  const client = new pg.Client({ connectionString: url })
  await client.connect()
  try {
    await client.query('BEGIN')
    await client.query('SELECT pg_advisory_xact_lock($1)', [LOCK])
    await client.query(`CREATE TABLE IF NOT EXISTS app_migrations (
      version    integer PRIMARY KEY,
      name       text NOT NULL,
      applied_at timestamptz NOT NULL DEFAULT now()
    )`)
    const { rows } = await client.query<{ version: number }>(
      'SELECT coalesce(max(version), 0)::int AS version FROM app_migrations',
    )
    const from = rows[0]?.version ?? 0
    if (from > migrations.length) {
      throw new Error(`The database is at migration ${from}, newer than this version's`)
    }
    for (const migration of migrations.slice(from)) {
      await client.query(migration.sql)
      await client.query('INSERT INTO app_migrations (version, name) VALUES ($1, $2)', [
        migration.version,
        migration.name,
      ])
    }
    await client.query('COMMIT')
    return migrations.length - from
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    await client.end()
  }
}
