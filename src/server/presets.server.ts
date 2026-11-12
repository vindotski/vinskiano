import { and, asc, count, eq, sql } from 'drizzle-orm'
import type { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { PRESETS_MAX, type Preset, type PresetSettings, parsePresetSettings } from '../synth/preset'
import { PublicError } from './public-error'
import { presets } from './schema'

/** A visitor tried to keep more than PRESETS_MAX presets (409). */
export class PresetLimitError extends PublicError {
  constructor() {
    super(`You can keep up to ${PRESETS_MAX} presets; delete one to save another`, 409)
  }
}

const columns = { id: presets.id, name: presets.name, settings: presets.settings }

const toPreset = (row: { id: string; name: string; settings: unknown }): Preset => ({
  id: row.id,
  name: row.name,
  settings: parsePresetSettings(row.settings),
})

/** A user's presets, by name. */
export async function listPresets(db: NodePgDatabase, userId: string): Promise<Preset[]> {
  const rows = await db
    .select(columns)
    .from(presets)
    .where(eq(presets.userId, userId))
    .orderBy(asc(presets.name))
  return rows.map(toPreset)
}

/** Saves the sound under a name; a preset that already has the name is replaced. */
export async function savePreset(
  db: NodePgDatabase,
  userId: string,
  name: string,
  settings: PresetSettings,
): Promise<Preset> {
  return db.transaction(async (tx) => {
    // Saves by one user wait for each other, so two at once can't both pass the limit.
    await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtext(${userId}))`)
    const [existing] = await tx
      .select({ id: presets.id })
      .from(presets)
      .where(and(eq(presets.userId, userId), eq(presets.name, name)))
    if (!existing) {
      const [kept] = await tx
        .select({ count: count() })
        .from(presets)
        .where(eq(presets.userId, userId))
      if ((kept?.count ?? 0) >= PRESETS_MAX) throw new PresetLimitError()
    }
    const [row] = await tx
      .insert(presets)
      .values({ userId, name, settings })
      .onConflictDoUpdate({
        target: [presets.userId, presets.name],
        set: { settings, updatedAt: sql`now()` },
      })
      .returning(columns)
    if (!row) throw new Error('Saving the preset returned no row')
    return toPreset(row)
  })
}

/** Deletes one of the user's presets; another user's id deletes nothing. */
export async function deletePreset(db: NodePgDatabase, userId: string, id: string) {
  await db.delete(presets).where(and(eq(presets.id, id), eq(presets.userId, userId)))
}
