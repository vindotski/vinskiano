import { describe, expect, test } from 'vitest'
import { KEYBOARD_NOTES } from './keyboard'
import Note from './Note'
import { TYPING_KEYS, typedNote, typingHints } from './typing-keyboard'

const C3 = new Note({ name: 'C', octave: 3 })

describe('the typing keyboard (FL Studio’s layout)', () => {
  test('the lower row is an octave from the base C, with sharps on the row above it', () => {
    const row = ['KeyZ', 'KeyS', 'KeyX', 'KeyD', 'KeyC', 'KeyV', 'KeyG', 'KeyB', 'KeyH', 'KeyN']
    expect(row.map((code) => typedNote(code, C3)?.toString())).toEqual([
      'C3',
      'C#3',
      'D3',
      'D#3',
      'E3',
      'F3',
      'F#3',
      'G3',
      'G#3',
      'A3',
    ])
    expect(['KeyJ', 'KeyM', 'Comma'].map((code) => typedNote(code, C3)?.toString())).toEqual([
      'A#3',
      'B3',
      'C4',
    ])
  })

  test('the upper row starts an octave up and runs on past it', () => {
    const row = ['KeyQ', 'Digit2', 'KeyW', 'Digit3', 'KeyE', 'KeyR', 'Digit5', 'KeyT']
    expect(row.map((code) => typedNote(code, C3)?.toString())).toEqual([
      'C4',
      'C#4',
      'D4',
      'D#4',
      'E4',
      'F4',
      'F#4',
      'G4',
    ])
    expect(
      ['Digit6', 'KeyY', 'Digit7', 'KeyU', 'KeyI', 'Digit9', 'KeyO', 'Digit0', 'KeyP'].map((code) =>
        typedNote(code, C3)?.toString(),
      ),
    ).toEqual(['G#4', 'A4', 'A#4', 'B4', 'C5', 'C#5', 'D5', 'D#5', 'E5'])
  })

  test('other keys, and notes past the keyboard’s end, play nothing', () => {
    expect(typedNote('KeyA', C3)).toBeNull()
    expect(typedNote('Space', C3)).toBeNull()
    expect(typedNote('KeyP', new Note({ name: 'C', octave: 7 }))).toBeNull() // E9
    expect(typedNote('KeyZ', new Note({ name: 'C', octave: 8 }))?.toString()).toBe('C8')
  })

  test('every mapped key has a letter to show on its key', () => {
    expect(Object.keys(TYPING_KEYS)).toHaveLength(30)
    const hints = typingHints(C3)
    expect(hints.get('C3')).toBe('Z')
    expect(hints.get('C4')).toBe('Q') // the upper row wins where the two rows meet
    expect(hints.get('C#4')).toBe('2')
    expect(hints.get('E5')).toBe('P')
    expect(hints.has('A2')).toBe(false)
    expect([...hints.keys()].every((name) => KEYBOARD_NOTES.some((n) => String(n) === name))).toBe(
      true,
    )
  })
})
