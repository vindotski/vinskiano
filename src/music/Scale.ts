import Note from './Note'

export interface ScaleOptions {
  name?: string
  rootNote?: Note
}

class Scale extends Array<Note> {
  name: string

  constructor(options: ScaleOptions = {}) {
    super()

    this.name = options.name || 'Unnamed Scale'
    this.push(options.rootNote || new Note())
  }

  override push(...notes: Note[]): number {
    for (const note of notes) {
      if (!(note instanceof Note)) {
        throw new Error('Scale can only contain Note objects')
      }
    }

    return super.push(...notes)
  }

  /** Index of the note with this name (e.g. 'C{sharp}'), or -1. */
  indexOfName(noteName: string): number {
    return this.findIndex((note) => noteName === note.name)
  }
}

export default Scale
