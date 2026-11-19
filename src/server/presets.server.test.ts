import { sql } from 'drizzle-orm'
import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres'
import pg from 'pg'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import { PRESETS_MAX, type PresetSettings } from '../synth/preset'
import { migrate } from './migrate.server'
import { MIGRATIONS } from './migrations'
import { deletePreset, listPresets, PresetLimitError, savePreset } from './presets.server'

// Runs against Spotcraft's local stack (`pnpm exec spotcraft dev`, settings in .env): Postgres
// with the app's schema, and the user pool, which makes the guests. Without DATABASE_URL it is
// skipped.
const hasDatabase = typeof process.env.DATABASE_URL === 'string' && process.env.DATABASE_URL !== ''

const sound = (gain: number): PresetSettings => ({
  master: { gain },
  oscillators: [
    { id: 1, waveform: 'sine', pitch: -12 },
    { id: 2, waveform: 'square', pitch: 0, mix: 0.5 },
    { id: 3, waveform: 'triangle', pitch: 12, mix: 0.25 },
  ],
})

describe.skipIf(!hasDatabase)('presets in Postgres', () => {
  const url = process.env.DATABASE_URL ?? ''
  let pool: pg.Pool
  let db: NodePgDatabase

  /**
   * A new guest from the local user pool, made as a browser makes one (the app may only read
   * and reference users). Each from its own address, so the pool's limit on new guests per
   * address doesn't stop repeated runs. The pool deletes idle guests; nothing to clean up.
   */
  async function user(): Promise<string> {
    const response = await fetch(`${process.env.AUTH_URL}/sign-in/anonymous`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        origin: 'http://localhost:3000',
        'x-spotcraft-client-ip': `198.51.100.${Math.floor(Math.random() * 250)}`,
      },
      body: '{}',
    })
    if (!response.ok) throw new Error(`The user pool answered ${response.status}`)
    const { user } = (await response.json()) as { user: { id: string } }
    return user.id
  }

  beforeAll(async () => {
    await migrate(url, MIGRATIONS)
    pool = new pg.Pool({ connectionString: url, max: 2 })
    db = drizzle(pool)
  })

  afterAll(async () => {
    await pool.end()
  })

  test('migrating again changes nothing', async () => {
    expect(await migrate(url, MIGRATIONS)).toBe(0)
    const { rows } = await db.execute<{ version: number }>(
      sql`SELECT version FROM app_migrations ORDER BY version`,
    )
    expect(rows.map((row) => row.version)).toEqual([1])
  })

  test('saves, lists by name, and replaces a preset saved under the same name', async () => {
    const me = await user()
    expect(await listPresets(db, me)).toEqual([])

    const warm = await savePreset(db, me, 'Warm', sound(0.5))
    await savePreset(db, me, 'Bright', sound(0.2))
    const replaced = await savePreset(db, me, 'Warm', sound(0.9))

    expect(replaced.id).toBe(warm.id)
    const list = await listPresets(db, me)
    expect(list.map((p) => [p.name, p.settings.master.gain])).toEqual([
      ['Bright', 0.2],
      ['Warm', 0.9],
    ])
    expect(list[1]?.settings).toEqual(sound(0.9))
  })

  test("a user never sees or deletes another user's presets", async () => {
    const me = await user()
    const someoneElse = await user()
    const mine = await savePreset(db, me, 'Mine', sound(0.5))

    expect(await listPresets(db, someoneElse)).toEqual([])
    await deletePreset(db, someoneElse, mine.id)
    expect(await listPresets(db, me)).toHaveLength(1)

    await deletePreset(db, me, mine.id)
    expect(await listPresets(db, me)).toEqual([])
  })

  test(`keeps at most ${PRESETS_MAX} presets, but replacing one still works`, async () => {
    const me = await user()
    for (let i = 0; i < PRESETS_MAX; i++) await savePreset(db, me, `Sound ${i}`, sound(0.5))

    await expect(savePreset(db, me, 'One more', sound(0.5))).rejects.toThrow(PresetLimitError)
    await expect(savePreset(db, me, 'Sound 0', sound(0.1))).resolves.toBeTruthy()
  })

  test('deleting the user in the pool deletes their presets', async () => {
    // Only the pool may delete users, so this checks the foreign key.
    const { rows } = await db.execute<{ confdeltype: string }>(
      sql`SELECT confdeltype FROM pg_constraint
          WHERE conrelid = 'presets'::regclass AND confrelid = 'auth.users'::regclass`,
    )
    expect(rows).toEqual([{ confdeltype: 'c' }])
  })
})
