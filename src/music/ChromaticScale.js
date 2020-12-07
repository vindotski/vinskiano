import Octave from './Octave'
import Note from './Note'

class ChromaticScale extends Array {
  constructor (rootNote) {
    super()

    const octave = Octave.make()
    const start = octave.indexOf(rootNote.name)
    const end = start + octave.length

    let noteOctave = rootNote.octave
    for (let i = start; i < end; i++) {
      const noteName = octave[i]

      if (noteName === 'C') {
        noteOctave++
      }

      this.push(new Note(noteName, noteOctave))
    }
  }

  indexOf (noteName) {
    return this.findIndex(note => noteName === note.name)
  }
}

export default ChromaticScale
