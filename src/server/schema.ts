import { users } from '@spotcraft/kit/schema'
import { jsonb, pgTable, text, timestamp, unique, uuid } from 'drizzle-orm/pg-core'

/**
 * The app's own tables, in `public`. Drizzle definitions for queries only: the tables are created
 * by the SQL files in ./migrations, which this has to match. `auth.*` belongs to Spotcraft.
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
