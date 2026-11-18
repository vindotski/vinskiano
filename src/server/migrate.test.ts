import { checkMigrations } from '@spotcraft/kit/migrate'
import { expect, test } from 'vitest'
import { MIGRATIONS } from './migrations'

test('the migrations are numbered from 1, in order, in snake_case', () => {
  expect(() => checkMigrations(MIGRATIONS)).not.toThrow()
  expect(MIGRATIONS.map((m) => m.version)).toEqual(MIGRATIONS.map((_, index) => index + 1))
})
