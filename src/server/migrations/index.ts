import type { Migration } from '@spotcraft/kit/migrate'
import presets from './0001_presets'

/**
 * The app's migrations, oldest first: SQL for the tables in `public`, one module per migration
 * (`NNNN_name.ts`). They only ever add: never drop or rename in a later one. Plain modules, not
 * `.sql` files, because the startup plugin runs them and Nitro bundles it without Vite's
 * `?raw` or `import.meta.glob`. The kit's runner applies them (`backend.server.ts`).
 */
export const MIGRATIONS: readonly Migration[] = [{ version: 1, name: 'presets', sql: presets }]
