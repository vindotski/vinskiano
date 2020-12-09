import Note from './Note'

const CHROMATIC_SCALE = [
  'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'
]

class Scale {
  constructor (rootNote, options = {}) {
    if (!(rootNote instanceof Note)) {
      throw new Error('rootNote must be instance of Note')
    }

    this.rootNote = rootNote
    this.halfsteps = options.halfsteps || 13
    this.notes = []

    const start = CHROMATIC_SCALE.indexOf(this.rootNote.name)
    const end = start + this.halfsteps

    for (let i = start; i < end; i++) {
      const noteIndex = i % CHROMATIC_SCALE.length
      const octaveOffset = Math.floor(i / 12)

      const noteName = CHROMATIC_SCALE[noteIndex]
      const noteOctave = this.rootNote.octave + octaveOffset
      this.notes.push(new Note(noteName, noteOctave))
    }

    return new Proxy(this, {
      set: () => {
        throw new Error('Scale is read-only object')
      }
    })
  }
}

export default Scale
