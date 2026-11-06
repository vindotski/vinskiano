import Note from './Note'
import ScaleBuilder from './ScaleBuilder'
import { ChromaticScaleStrategy } from './ScaleStrategy'

const ROOT_HERTZ = 440
const SEMITONE = 2 ** (1 / 12)
const ROOT_NOTE = new Note({ name: 'A', octave: 4 })

const SCALE = new ScaleBuilder({
  rootNote: ROOT_NOTE,
  strategy: new ChromaticScaleStrategy(),
}).build()

const A_NOTE_INDEX = SCALE.indexOfName('A')
const OCTAVE_SHIFT_INDEX = SCALE.indexOfName('C')
const SCALE_OFFSET = (SCALE.length - A_NOTE_INDEX) % 12

class Frequency {
  hertz: number

  constructor(hertz: number) {
    this.hertz = hertz
  }

  scale(semitones: number): void {
    this.hertz = this.hertz * SEMITONE ** semitones
  }

  toString(): string {
    return `${this.hertz} Hz`
  }

  static fromNote(note: Note): Frequency {
    if (!(note instanceof Note)) {
      throw new Error('note must be an instance of Note class')
    }

    const noteIndex = SCALE_OFFSET + SCALE.indexOfName(note.name)
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
