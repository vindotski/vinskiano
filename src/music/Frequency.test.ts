import { describe, expect, test } from 'vitest'
import Frequency from './Frequency'
import Note from './Note'
import Octave from './Octave'

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
    Octave.make().map((note, index) => ({ name: note.name, index, octave })),
  )

  test('matches equal temperament for every note from C0 to B8', () => {
    for (const { name, index, octave } of allNotes) {
      const hertz = Frequency.fromNote(new Note({ name, octave })).hertz
      expect(hertz, `${name}${octave}`).toBeCloseTo(expectedHertz(index, octave), 6)
    }
  })

  test('rejects anything that is not a Note', () => {
    // @ts-expect-error: checking the runtime guard for untyped callers
    expect(() => Frequency.fromNote({ name: 'A', octave: 4 })).toThrow(/instance of Note/)
  })
})

describe('Frequency', () => {
  test('scale() moves by semitones', () => {
    const frequency = new Frequency(440)
    frequency.scale(12)
    expect(frequency.hertz).toBeCloseTo(880, 9)
    frequency.scale(-24)
    expect(frequency.hertz).toBeCloseTo(220, 9)
  })

  test('prints in hertz', () => {
    expect(new Frequency(440).toString()).toBe('440 Hz')
  })
})
