const NAME_PATTERN = /^[a-gA-G]({sharp}|{flat})?$/

export interface NoteOptions {
  name?: string
  octave?: number
}

class Note {
  readonly name: string
  readonly octave: number
  /** Its name, e.g. "C#4": computed once (keys look notes up by it all the time). */
  private readonly label: string

  constructor(options: NoteOptions = {}) {
    const name = options.name || 'A'

    if (!NAME_PATTERN.test(name)) {
      throw new Error('Note name must be letter between A to G (inclusive)')
    }

    this.name = name
    this.octave = options.octave ?? 4
    this.label = `${name.replace('{sharp}', '#').replace('{flat}', 'b')}${this.octave}`
  }

  /** Same pitch: equal name and octave (notes are compared by value, not identity). */
  equals(other: Note): boolean {
    return this.name === other.name && this.octave === other.octave
  }

  toString(): string {
    return this.label
  }
}

export default Note
