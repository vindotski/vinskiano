import { type Backend, backendFromEnv } from '@spotcraft/kit'
import { sql } from 'drizzle-orm'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import { PRESETS_MAX, type PresetSettings } from '../synth/preset'
import { migrate } from './migrate.server'
import { deletePreset, listPresets, PresetLimitError, savePreset } from './presets.server'

// Runs against a real Postgres with Spotcraft's `auth` schema: locally the one from
// `spotcraft dev start` (DATABASE_URL etc. in .env). Without DATABASE_URL it is skipped.
const hasDatabase = typeof process.env.DATABASE_URL === 'string' && process.env.DATABASE_URL !== ''

const sound = (gain: number): PresetSettings => ({
  master: { gain },
  oscillators: [
    { id: 1, waveform: 'sine', pitch: -12, volume: 0.5 },
    { id: 2, waveform: 'square', pitch: 0, volume: 0.25 },
    { id: 3, waveform: 'triangle', pitch: 12, volume: 0.75 },
  ],
})

describe.skipIf(!hasDatabase)('presets in Postgres', () => {
  let kit: Backend
  const users: string[] = []

  /** A user straight in auth.users, as a guest would be; deleted (with its presets) afterwards. */
  async function user(): Promise<string> {
    const { rows } = await kit.db.execute<{ id: string }>(
      sql`INSERT INTO auth.users (email, is_anonymous)
          VALUES (${`test-${crypto.randomUUID()}@presets.test.invalid`}, true) RETURNING id`,
    )
    const id = rows[0]?.id
    if (!id) throw new Error('No user created')
    users.push(id)
    return id
  }

  beforeAll(async () => {
    // PUBLIC_URL only matters for cookies, which these tests never send.
    kit = backendFromEnv({ PUBLIC_URL: 'http://localhost:3000', ...process.env })
    await migrate(kit.db)
  })

  afterAll(async () => {
    for (const id of users) await kit.db.execute(sql`DELETE FROM auth.users WHERE id = ${id}`)
    await kit.close()
  })

  test('migrating again changes nothing', async () => {
    await migrate(kit.db)
    const { rows } = await kit.db.execute<{ version: number }>(
      sql`SELECT version FROM app_migrations ORDER BY version`,
    )
    expect(rows.map((row) => row.version)).toEqual([1])
  })

  test('saves, lists by name, and replaces a preset saved under the same name', async () => {
    const me = await user()
    expect(await listPresets(kit.db, me)).toEqual([])

    const warm = await savePreset(kit.db, me, 'Warm', sound(0.5))
    await savePreset(kit.db, me, 'Bright', sound(0.2))
    const replaced = await savePreset(kit.db, me, 'Warm', sound(0.9))

    expect(replaced.id).toBe(warm.id)
    const list = await listPresets(kit.db, me)
    expect(list.map((p) => [p.name, p.settings.master.gain])).toEqual([
      ['Bright', 0.2],
      ['Warm', 0.9],
    ])
    expect(list[1]?.settings).toEqual(sound(0.9))
  })

  test("a user never sees or deletes another user's presets", async () => {
    const me = await user()
    const someoneElse = await user()
    const mine = await savePreset(kit.db, me, 'Mine', sound(0.5))

    expect(await listPresets(kit.db, someoneElse)).toEqual([])
    await deletePreset(kit.db, someoneElse, mine.id)
    expect(await listPresets(kit.db, me)).toHaveLength(1)

    await deletePreset(kit.db, me, mine.id)
    expect(await listPresets(kit.db, me)).toEqual([])
  })

  test(`keeps at most ${PRESETS_MAX} presets, but replacing one still works`, async () => {
    const me = await user()
    for (let i = 0; i < PRESETS_MAX; i++) await savePreset(kit.db, me, `Sound ${i}`, sound(0.5))

    await expect(savePreset(kit.db, me, 'One more', sound(0.5))).rejects.toThrow(PresetLimitError)
    await expect(savePreset(kit.db, me, 'Sound 0', sound(0.1))).resolves.toBeTruthy()
  })

  test('deleting the user deletes their presets', async () => {
    const me = await user()
    await savePreset(kit.db, me, 'Gone', sound(0.5))
    await kit.db.execute(sql`DELETE FROM auth.users WHERE id = ${me}`)
    expect(await listPresets(kit.db, me)).toEqual([])
  })
})
