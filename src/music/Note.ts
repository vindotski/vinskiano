const NAME_PATTERN = /^[a-gA-G]({sharp}|{flat})?$/

/** The twelve note names of an octave, from C. */
export const NOTE_NAMES: readonly string[] = [
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
]

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

  /** The note's MIDI number (C4 = 60, A4 = 69). Only for the names in NOTE_NAMES. */
  midi(): number {
    const index = NOTE_NAMES.indexOf(this.name)
    if (index < 0) throw new Error(`No MIDI number for ${this.label}`)
    return (this.octave + 1) * 12 + index
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
