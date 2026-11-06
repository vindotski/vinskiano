const NAME_PATTERN = /^[a-gA-G]({sharp}|{flat})?$/

export interface NoteOptions {
  name?: string
  octave?: number
}

class Note {
  name: string
  octave: number

  constructor(options: NoteOptions = {}) {
    const name = options.name || 'A'

    if (!NAME_PATTERN.test(name)) {
      throw new Error('Note name must be letter between A to G (inclusive)')
    }

    this.name = name
    this.octave = options.octave || 4
  }

  /** Same pitch: equal name and octave (notes are compared by value, not identity). */
  equals(other: Note): boolean {
    return this.name === other.name && this.octave === other.octave
  }

  toString(): string {
    let name = this.name
    name = name.replace('{sharp}', '#')
    name = name.replace('{flat}', ' b')
    return `${name}${this.octave}`
  }
}

export default Note
