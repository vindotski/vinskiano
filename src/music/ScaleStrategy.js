import Note from './Note'
import Octave from './Octave'

class ScaleStrategy {
  constructor (options = {}) {
    this.octave = options.octave || Octave.make()
  }

  generate (rootNote) {
    if (!(rootNote instanceof Note)) {
      throw new Error('ScaleStrategy.rootNote must be an instance of Note class')
    }

    throw new Error('Scale strategy not implemented')
  }
}

class ChromaticScaleStrategy extends ScaleStrategy {
  generate (rootNote) {
    const notes = []
    const start = this.octave.indexOf(rootNote.name) + 1
    const end = start + this.octave.length - 1
    let rootOctave = rootNote.octave

    for (let i = start; i < end; i++) {
      const note = new Note({
        name: this.octave[i].name,
        octave: rootOctave,
        offset: (i % this.octave.length) * 100
      })

      if (note.name === 'C') {
        note.octave = ++rootOctave
      }

      notes.push(note)
    }

    return notes
  }
}

export {
  ScaleStrategy,
  ChromaticScaleStrategy
}
