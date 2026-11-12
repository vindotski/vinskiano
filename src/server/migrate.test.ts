import { expect, test } from 'vitest'
import { type Migration, migrations, pending } from './migrate.server'

const list = (...versions: number[]): Migration[] =>
  versions.map((version) => ({ version, name: `m${version}`, sql: '' }))

test('the migrations are numbered from 1, in order', () => {
  expect(migrations.map((m) => m.version)).toEqual(migrations.map((_, index) => index + 1))
})

test('runs what the database has not had yet', () => {
  expect(pending(list(1, 2, 3), []).map((m) => m.version)).toEqual([1, 2, 3])
  expect(pending(list(1, 2, 3), [1]).map((m) => m.version)).toEqual([2, 3])
  expect(pending(list(1, 2, 3), [1, 2, 3])).toEqual([])
})

test('refuses a migration numbered below one the database already has', () => {
  expect(() => pending(list(1, 2, 3), [1, 3])).toThrow(
    'Migration 2 (m2) is numbered below 3, which the database already has',
  )
})
