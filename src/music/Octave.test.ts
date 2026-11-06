import { describe, expect, test } from 'vitest'
import Note from './Note'
import Octave from './Octave'

const names = (notes: Iterable<Note>) => Array.from(notes, (note) => note.name)

describe('Octave', () => {
  test('has the 12 chromatic notes from C to B by default', () => {
    expect(names(Octave.make())).toEqual([
      'C',
      'C{sharp}',
      'D',
      'D{sharp}',
      'E',
      'F',
      'F{sharp}',
      'G',
      'G{sharp}',
      'A',
      'A{sharp}',
      'B',
    ])
  })

  test('get() wraps around the octave', () => {
    const octave = Octave.make()
    expect(octave.get(0).name).toBe('C')
    expect(octave.get(12).name).toBe('C')
    expect(octave.get(13).name).toBe('C{sharp}')
    expect(octave.get(35).name).toBe('B')
  })

  test('get() throws instead of returning undefined', () => {
    expect(() => Octave.make().get(-1)).toThrow(RangeError)
    expect(() => Octave.make([]).get(0)).toThrow(RangeError)
  })

  test('indexOfName() finds notes by name', () => {
    const octave = Octave.make()
    expect(octave.indexOfName('C')).toBe(0)
    expect(octave.indexOfName('A')).toBe(9)
    expect(octave.indexOfName('H')).toBe(-1)
  })

  test('is frozen', () => {
    const octave = Octave.make()
    expect(Object.isFrozen(octave)).toBe(true)
    expect(() => octave.push(new Note())).toThrow(TypeError)
  })

  test('map() and filter() return plain arrays', () => {
    const octave = Octave.make()
    expect(octave.map((note) => note.name)).not.toBeInstanceOf(Octave)
    expect(octave.filter((note) => note.name.includes('{'))).toHaveLength(5)
  })

  test('can be made from custom notes', () => {
    const octave = Octave.make([new Note({ name: 'C' }), new Note({ name: 'G' })])
    expect(names(octave)).toEqual(['C', 'G'])
    expect(octave.get(3).name).toBe('G')
  })
})
