import { describe, expect, test } from 'vitest'
import Note from './Note'
import Scale from './Scale'
import ScaleBuilder from './ScaleBuilder'
import { ChromaticScaleStrategy } from './ScaleStrategy'

const chromatic = (name: string, octave: number) =>
  new ScaleBuilder({
    rootNote: new Note({ name, octave }),
    strategy: new ChromaticScaleStrategy(),
  }).build()

describe('ScaleBuilder with ChromaticScaleStrategy', () => {
  test('builds 12 notes from C4 to B4', () => {
    expect(Array.from(chromatic('C', 4), String)).toEqual([
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
    ])
  })

  test('moves to the next octave at C', () => {
    expect(Array.from(chromatic('A', 4), String)).toEqual([
      'A4',
      'A#4',
      'B4',
      'C5',
      'C#5',
      'D5',
      'D#5',
      'E5',
      'F5',
      'F#5',
      'G5',
      'G#5',
    ])
  })

  test('returns a Scale', () => {
    expect(chromatic('C', 4)).toBeInstanceOf(Scale)
  })

  test('builds a chromatic scale from A4 by default', () => {
    expect(Array.from(new ScaleBuilder().build(), String)).toEqual(
      Array.from(chromatic('A', 4), String),
    )
  })
})

describe('Scale', () => {
  test('starts with its root note', () => {
    const root = new Note({ name: 'D', octave: 3 })
    expect([...new Scale({ rootNote: root })]).toEqual([root])
  })

  test('only accepts notes', () => {
    const scale = new Scale()
    // @ts-expect-error: checking the runtime guard for untyped callers
    expect(() => scale.push('C')).toThrow(/only contain Note/)
  })

  test('indexOfName() finds notes by name', () => {
    const scale = chromatic('C', 4)
    expect(scale.indexOfName('E')).toBe(4)
    expect(scale.indexOfName('H')).toBe(-1)
  })

  // Array methods build their result through Symbol.species. If that were
  // Scale, its constructor would push a phantom root note into every result.
  test('filter() can return an empty result', () => {
    expect(chromatic('C', 4).filter(() => false)).toEqual([])
  })

  test('map() returns a plain array', () => {
    const mapped = chromatic('C', 4).map(String)
    expect(mapped).not.toBeInstanceOf(Scale)
    expect(mapped.slice(0, 3)).toEqual(['C4', 'C#4', 'D4'])
  })
})
