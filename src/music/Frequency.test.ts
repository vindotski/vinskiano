import { describe, expect, test } from 'vitest'
import Frequency from './Frequency'
import Note, { NOTE_NAMES } from './Note'

/** Equal temperament: 440 Hz * 2^(semitones from A4 / 12), via MIDI numbers (A4 = 69). */
const expectedHertz = (noteIndex: number, octave: number) => {
  const midi = (octave + 1) * 12 + noteIndex
  return 440 * 2 ** ((midi - 69) / 12)
}

describe('Frequency.fromNote', () => {
  test.each([
    ['A', 4, 440],
    ['A', 5, 880],
    ['A', 3, 220],
    ['C', 4, 261.626],
    ['C', 5, 523.251],
    ['C{sharp}', 4, 277.183],
    ['B', 3, 246.942],
  ])('%s%i is %d Hz', (name, octave, hertz) => {
    expect(Frequency.fromNote(new Note({ name, octave })).hertz).toBeCloseTo(hertz, 3)
  })

  const allNotes = [0, 1, 2, 3, 4, 5, 6, 7, 8].flatMap((octave) =>
    NOTE_NAMES.map((name, index) => ({ name, index, octave })),
  )

  test('matches equal temperament for every note from C0 to B8', () => {
    for (const { name, index, octave } of allNotes) {
      const hertz = Frequency.fromNote(new Note({ name, octave })).hertz
      expect(hertz, `${name}${octave}`).toBeCloseTo(expectedHertz(index, octave), 6)
    }
  })

  test('has no frequency for a name outside the twelve', () => {
    expect(() => Frequency.fromNote(new Note({ name: 'B{flat}', octave: 4 }))).toThrow(/No MIDI/)
  })
})
