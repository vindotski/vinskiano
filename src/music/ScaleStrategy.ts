import Note from './Note'
import Octave from './Octave'

export interface ScaleStrategyOptions {
  octave?: Octave
}

abstract class ScaleStrategy {
  octave: Octave

  constructor(options: ScaleStrategyOptions = {}) {
    this.octave = options.octave || Octave.make()
  }

  /** The notes that follow `rootNote` in the scale (the root itself excluded). */
  abstract generate(rootNote: Note): Note[]
}

class ChromaticScaleStrategy extends ScaleStrategy {
  override generate(rootNote: Note): Note[] {
    const notes: Note[] = []
    const start = this.octave.indexOfName(rootNote.name) + 1
    const end = start + this.octave.length - 1
    let rootOctave = rootNote.octave

    for (let i = start; i < end; i++) {
      const note = new Note({
        name: this.octave.get(i).name,
        octave: rootOctave,
      })

      if (note.name === 'C') {
        note.octave = ++rootOctave
      }

      notes.push(note)
    }

    return notes
  }
}

export { ChromaticScaleStrategy, ScaleStrategy }
