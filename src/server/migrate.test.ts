import { expect, test } from 'vitest'
import { checkMigrations } from './migrate.server'
import { MIGRATIONS } from './migrations'

test('the migrations are numbered from 1, in order, in snake_case', () => {
  expect(() => checkMigrations(MIGRATIONS)).not.toThrow()
  expect(MIGRATIONS.map((m) => m.version)).toEqual(MIGRATIONS.map((_, index) => index + 1))
})

test('a gap or a name that is not snake_case is refused', () => {
  expect(() => checkMigrations([{ version: 2, name: 'presets', sql: '' }])).toThrow(/version 1/)
  expect(() => checkMigrations([{ version: 1, name: 'Presets', sql: '' }])).toThrow(/snake_case/)
})
