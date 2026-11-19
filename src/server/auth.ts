import { boolean, pgSchema, timestamp, uuid } from 'drizzle-orm/pg-core'

/**
 * Spotcraft's user pool, shared by every app on the server. The app may read these columns and
 * point foreign keys at `id`; deleting a user there deletes their presets.
 */
export const users = pgSchema('auth').table('users', {
  id: uuid('id').primaryKey(),
  isAnonymous: boolean('is_anonymous').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
})
