import { expect, test } from 'vitest'
import { KEYBOARD_NOTES, MIDDLE_C, WHITE_NOTES } from './keyboard'

test('the keyboard has a piano’s 88 keys, from A0 to C8', () => {
  expect(KEYBOARD_NOTES).toHaveLength(88)
  expect(KEYBOARD_NOTES.slice(0, 4).map(String)).toEqual(['A0', 'A#0', 'B0', 'C1'])
  expect(KEYBOARD_NOTES.slice(-2).map(String)).toEqual(['B7', 'C8'])
})

test('it goes up a semitone at a time, with no gaps or repeats', () => {
  const names = KEYBOARD_NOTES.map(String)
  expect(new Set(names).size).toBe(88)
  expect(names.slice(39, 52)).toEqual([
    'C4',
    'C#4',
    'D4',
    'D#4',
    'E4',
    'F4',
    'F#4',
    'G4',
    'G#4',
    'A4',
    'A#4',
    'B4',
    'C5',
  ])
})

test('52 of them are white keys, and middle C is C4', () => {
  expect(WHITE_NOTES).toHaveLength(52)
  expect(String(MIDDLE_C)).toBe('C4')
  expect(KEYBOARD_NOTES.some((note) => note.equals(MIDDLE_C))).toBe(true)
})
