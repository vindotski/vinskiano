import Note from './Note'

class Octave extends Array<Note> {
  static readonly DEFAULT: readonly Note[] = [
    new Note({ name: 'C', octave: -1 }),
    new Note({ name: 'C{sharp}', octave: -1 }),
    new Note({ name: 'D', octave: -1 }),
    new Note({ name: 'D{sharp}', octave: -1 }),
    new Note({ name: 'E', octave: -1 }),
    new Note({ name: 'F', octave: -1 }),
    new Note({ name: 'F{sharp}', octave: -1 }),
    new Note({ name: 'G', octave: -1 }),
    new Note({ name: 'G{sharp}', octave: -1 }),
    new Note({ name: 'A', octave: -1 }),
    new Note({ name: 'A{sharp}', octave: -1 }),
    new Note({ name: 'B', octave: -1 }),
  ]

  // Array methods (map, filter, slice, ...) create their result with
  // `new this.constructor[Symbol.species](length)`. Return plain arrays instead.
  static override get [Symbol.species](): ArrayConstructor {
    return Array
  }

  /** Note at `index`, wrapping around the octave: get(12) === get(0). */
  get(index: number): Note {
    const note = this[index % this.length]
    if (!note) {
      throw new RangeError(`No note at index ${index} in an octave of ${this.length}`)
    }
    return note
  }

  /** Index of the note with this name (e.g. 'C{sharp}'), or -1. */
  indexOfName(noteName: string): number {
    return this.findIndex((note) => noteName === note.name)
  }

  static make(notes: readonly Note[] | null = null): Octave {
    const octave = new Octave()
    for (const note of notes || Octave.DEFAULT) {
      octave.push(note)
    }
    Object.freeze(octave)
    return octave
  }
}

export default Octave
