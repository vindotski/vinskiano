import { expect, test } from 'vitest'
import { toOscillatorId } from './oscillators'

test('reads ids from numbers and URL strings', () => {
  expect(toOscillatorId(2)).toBe(2)
  expect(toOscillatorId('3')).toBe(3)
})

test.each([0, 4, '4', '01', '2.0', 1.5, '', null, undefined, 'one'])('rejects %j', (value) => {
  expect(toOscillatorId(value)).toBeUndefined()
})
