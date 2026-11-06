import Note from './Note'
import ScaleBuilder from './ScaleBuilder'
import { ChromaticScaleStrategy } from './ScaleStrategy'

const ROOT_HERTZ = 440
const SEMITONE = Math.pow(2, 1 / 12)
const ROOT_NOTE = new Note('A', 4)

const scaleOptions = {
  rootNote: ROOT_NOTE,
  strategy: new ChromaticScaleStrategy(),
}
const SCALE = new ScaleBuilder(scaleOptions).build()

const A_NOTE_INDEX = SCALE.indexOf('A')
const OCTAVE_SHIFT_INDEX = SCALE.indexOf('C')
const SCALE_OFFSET = (SCALE.length - A_NOTE_INDEX) % 12

class Frequency {
  constructor(hertz) {
    this.hertz = hertz
  }

  scale(semitones) {
    this.hertz = this.hertz * Math.pow(SEMITONE, semitones)
  }

  toString() {
    return `${this.hertz} Hz`
  }

  static fromNote(note) {
    if (!(note instanceof Note)) {
      throw new Error('note must be an instance of Note class')
    }

    const noteIndex = SCALE_OFFSET + SCALE.indexOf(note.name)
    const octaveOffset = note.octave - ROOT_NOTE.octave
    let semitoneOffset = noteIndex + octaveOffset * SCALE.length

    if (noteIndex >= OCTAVE_SHIFT_INDEX) {
      semitoneOffset -= SCALE.length
    }

    const frequency = new Frequency(ROOT_HERTZ)
    frequency.scale(semitoneOffset)
    return frequency
  }
}

export default Frequency
