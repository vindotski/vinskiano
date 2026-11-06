import { describe, expect, test } from 'vitest'
import Note from './Note'

describe('Note', () => {
  test('defaults to A4', () => {
    const note = new Note()
    expect(note.name).toBe('A')
    expect(note.octave).toBe(4)
  })

  test.each(['C', 'c', 'G', 'C{sharp}', 'B{flat}'])('accepts the name %s', (name) => {
    expect(new Note({ name }).name).toBe(name)
  })

  test.each(['H', 'C#', 'Cb', 'C{sharp}{sharp}', ' C'])('rejects the name %j', (name) => {
    expect(() => new Note({ name })).toThrow(/between A to G/)
  })

  test('prints sharps with #', () => {
    expect(new Note({ name: 'C{sharp}', octave: 4 }).toString()).toBe('C#4')
    expect(new Note({ name: 'E', octave: 2 }).toString()).toBe('E2')
  })

  test('compares by value, not identity', () => {
    const a = new Note({ name: 'C', octave: 5 })
    expect(a.equals(new Note({ name: 'C', octave: 5 }))).toBe(true)
    expect(a.equals(new Note({ name: 'C', octave: 4 }))).toBe(false)
    expect(a.equals(new Note({ name: 'C{sharp}', octave: 5 }))).toBe(false)
  })

  // BUG: `options.octave || 4` treats octave 0 as missing.
  test.fails('keeps octave 0', () => {
    expect(new Note({ name: 'C', octave: 0 }).octave).toBe(0)
  })
})
