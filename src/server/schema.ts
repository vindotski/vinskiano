import { jsonb, pgTable, text, timestamp, unique, uuid } from 'drizzle-orm/pg-core'
import { users } from './auth'

/**
 * The app's own tables, in its schema on Spotcraft (`app_vinskiano`, the role's search path).
 * Drizzle definitions for queries only: the tables are created by the SQL in ./migrations, which
 * this has to match. `auth.users` is Spotcraft's user pool.
 */
export const presets = pgTable(
  'presets',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    // Checked with parsePresetSettings on the way in and out.
    settings: jsonb('settings').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [unique().on(table.userId, table.name)],
)
