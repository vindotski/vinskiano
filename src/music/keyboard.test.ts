import { expect, test } from 'vitest'
import { KEYBOARD_NOTES } from './keyboard'

test('the keyboard spans 13 keys from C4 to C5', () => {
  expect(KEYBOARD_NOTES.map(String)).toEqual([
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
