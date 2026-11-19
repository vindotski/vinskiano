// With `.ts`: scripts/migrate.ts loads this under Node's type stripping.
import presets from './0001_presets.ts'

/** One migration: its version (from 1, in order), a snake_case name and its SQL. */
export interface Migration {
  version: number
  name: string
  sql: string
}

/**
 * The app's migrations, oldest first: SQL for its tables, one module per migration
 * (`NNNN_name.ts`). Unqualified names land in the app's schema (the role's search path). They
 * only ever add: never drop or rename in a later one. Plain modules, not `.sql` files, because
 * the startup plugin runs them and Nitro bundles it without Vite's `?raw` or
 * `import.meta.glob`. `migrate.server.ts` applies them.
 */
export const MIGRATIONS: readonly Migration[] = [{ version: 1, name: 'presets', sql: presets }]
