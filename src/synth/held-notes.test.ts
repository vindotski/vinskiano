import { describe, expect, test } from 'vitest'
import { Note } from '../music'
import HeldNotes from './held-notes'

const C4 = new Note({ name: 'C', octave: 4 })
const D4 = new Note({ name: 'D', octave: 4 })
const names = (notes: readonly Note[]) => notes.map(String)

describe('HeldNotes', () => {
  test('a press starts its note; its release stops it', () => {
    const held = new HeldNotes()
    expect(held.press('pointer:1', C4)).toEqual({ start: C4, stop: null })
    expect(names(held.notes())).toEqual(['C4'])
    expect(held.release('pointer:1')).toEqual(C4)
    expect(held.notes()).toEqual([])
  })

  test('a note held twice (two fingers on one key) sounds until both let go', () => {
    const held = new HeldNotes()
    expect(held.press('pointer:1', C4).start).toEqual(C4)
    expect(held.press('pointer:2', new Note({ name: 'C', octave: 4 })).start).toBeNull()
    expect(held.release('pointer:1')).toBeNull()
    expect(names(held.notes())).toEqual(['C4'])
    expect(held.release('pointer:2')).toEqual(C4)
  })

  test('pressing another note from the same source moves to it (a slide)', () => {
    const held = new HeldNotes()
    held.press('pointer:1', C4)
    expect(held.press('pointer:1', D4)).toEqual({ start: D4, stop: C4 })
    expect(names(held.notes())).toEqual(['D4'])
  })

  test('pressing the note a source already holds changes nothing', () => {
    const held = new HeldNotes()
    held.press('pointer:1', C4)
    expect(held.press('pointer:1', C4)).toEqual({ start: null, stop: null })
  })

  test('sliding off a note another source still holds keeps it sounding', () => {
    const held = new HeldNotes()
    held.press('pointer:1', C4)
    held.press('pointer:2', C4)
    expect(held.press('pointer:1', D4)).toEqual({ start: D4, stop: null })
    expect(names(held.notes()).sort()).toEqual(['C4', 'D4'])
  })

  test('releasing a source that holds nothing does nothing', () => {
    expect(new HeldNotes().release('pointer:9')).toBeNull()
  })

  test('releaseAll stops every note once', () => {
    const held = new HeldNotes()
    held.press('pointer:1', C4)
    held.press('pointer:2', C4)
    held.press('key:Space', D4)
    expect(names(held.releaseAll()).sort()).toEqual(['C4', 'D4'])
    expect(held.notes()).toEqual([])
  })
})
